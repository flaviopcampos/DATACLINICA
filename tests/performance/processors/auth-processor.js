/**
 * =============================================================================
 * Processador de Autenticação para Testes de Performance - Artillery
 * DataClinica - Funções auxiliares para testes de carga
 * =============================================================================
 */

const crypto = require('crypto');
const faker = require('faker');

// Configurar locale para português brasileiro
faker.locale = 'pt_BR';

/**
 * Função executada antes de cada cenário
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function beforeScenario(requestParams, context, ee, next) {
    // Gerar dados aleatórios para o usuário
    context.vars.randomEmail = faker.internet.email().toLowerCase();
    context.vars.randomName = faker.name.findName();
    context.vars.randomPhone = faker.phone.phoneNumber('11#########');
    context.vars.randomCPF = generateCPF();
    context.vars.randomPassword = 'Test123!';
    context.vars.timestamp = Date.now();
    
    // Log do início do cenário
    console.log(`[${new Date().toISOString()}] Starting scenario for user: ${context.vars.randomEmail}`);
    
    return next();
}

/**
 * Função executada após cada cenário
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function afterScenario(requestParams, response, context, ee, next) {
    const duration = Date.now() - context.vars.timestamp;
    console.log(`[${new Date().toISOString()}] Scenario completed in ${duration}ms for user: ${context.vars.randomEmail}`);
    
    return next();
}

/**
 * Função para processar resposta de login
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function processLoginResponse(requestParams, response, context, ee, next) {
    if (response.statusCode === 200 && response.body) {
        try {
            const body = JSON.parse(response.body);
            if (body.access_token) {
                context.vars.authToken = body.access_token;
                context.vars.userId = body.user?.id;
                console.log(`[${new Date().toISOString()}] Login successful for: ${context.vars.email}`);
            } else {
                console.error(`[${new Date().toISOString()}] Login failed - no token received`);
                ee.emit('error', new Error('Login failed - no token received'));
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error parsing login response:`, error);
            ee.emit('error', error);
        }
    } else {
        console.error(`[${new Date().toISOString()}] Login failed with status:`, response.statusCode);
        ee.emit('error', new Error(`Login failed with status: ${response.statusCode}`));
    }
    
    return next();
}

/**
 * Função para processar resposta de criação de paciente
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function processPatientCreation(requestParams, response, context, ee, next) {
    if (response.statusCode === 201 && response.body) {
        try {
            const body = JSON.parse(response.body);
            if (body.id) {
                context.vars.patientId = body.id;
                console.log(`[${new Date().toISOString()}] Patient created with ID: ${body.id}`);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error parsing patient creation response:`, error);
        }
    }
    
    return next();
}

/**
 * Função para validar resposta da API
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validateApiResponse(requestParams, response, context, ee, next) {
    const url = requestParams.url;
    const method = requestParams.method || 'GET';
    const statusCode = response.statusCode;
    const responseTime = response.timings?.response || 0;
    
    // Log da requisição
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} (${responseTime}ms)`);
    
    // Validar status codes esperados
    const validStatusCodes = [200, 201, 202, 204];
    if (!validStatusCodes.includes(statusCode)) {
        console.error(`[${new Date().toISOString()}] Unexpected status code: ${statusCode} for ${method} ${url}`);
        ee.emit('error', new Error(`Unexpected status code: ${statusCode}`));
    }
    
    // Validar tempo de resposta
    if (responseTime > 5000) {
        console.warn(`[${new Date().toISOString()}] Slow response: ${responseTime}ms for ${method} ${url}`);
        ee.emit('customStat', 'slow_responses', 1);
    }
    
    // Validar se é JSON válido para APIs
    if (url.includes('/api/') && response.body) {
        try {
            JSON.parse(response.body);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Invalid JSON response for ${method} ${url}`);
            ee.emit('error', new Error('Invalid JSON response'));
        }
    }
    
    return next();
}

/**
 * Função para gerar CPF válido
 * @returns {string} CPF válido
 */
function generateCPF() {
    const cpf = [];
    
    // Gerar os 9 primeiros dígitos
    for (let i = 0; i < 9; i++) {
        cpf.push(Math.floor(Math.random() * 9));
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += cpf[i] * (10 - i);
    }
    let remainder = sum % 11;
    cpf.push(remainder < 2 ? 0 : 11 - remainder);
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += cpf[i] * (11 - i);
    }
    remainder = sum % 11;
    cpf.push(remainder < 2 ? 0 : 11 - remainder);
    
    return cpf.join('');
}

/**
 * Função para gerar dados de teste aleatórios
 * @param {Object} context - Contexto do usuário virtual
 */
function generateTestData(context) {
    context.vars.testPatient = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.phoneNumber('11#########'),
        birth_date: faker.date.between('1950-01-01', '2005-12-31').toISOString().split('T')[0],
        cpf: generateCPF(),
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            zip_code: faker.address.zipCode('#####-###')
        }
    };
    
    context.vars.testAppointment = {
        appointment_date: faker.date.future(1).toISOString(),
        notes: faker.lorem.sentence(),
        type: faker.random.arrayElement(['consulta', 'retorno', 'exame'])
    };
}

/**
 * Função para simular tempo de pensamento do usuário
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} next - Callback para continuar
 */
function simulateThinkTime(context, next) {
    const thinkTime = Math.random() * 3000 + 1000; // Entre 1-4 segundos
    setTimeout(next, thinkTime);
}

/**
 * Função para coletar métricas customizadas
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function collectCustomMetrics(requestParams, response, context, ee, next) {
    const url = requestParams.url;
    const responseTime = response.timings?.response || 0;
    
    // Métricas por endpoint
    if (url.includes('/auth/login')) {
        ee.emit('customStat', 'login_response_time', responseTime);
    } else if (url.includes('/patients')) {
        ee.emit('customStat', 'patients_response_time', responseTime);
    } else if (url.includes('/appointments')) {
        ee.emit('customStat', 'appointments_response_time', responseTime);
    }
    
    // Métricas de performance
    if (responseTime < 500) {
        ee.emit('customStat', 'fast_responses', 1);
    } else if (responseTime > 2000) {
        ee.emit('customStat', 'slow_responses', 1);
    }
    
    return next();
}

/**
 * Função para cleanup após erro
 * @param {Object} context - Contexto do usuário virtual
 * @param {Function} next - Callback para continuar
 */
function cleanupOnError(context, next) {
    // Limpar tokens e dados sensíveis
    delete context.vars.authToken;
    delete context.vars.userId;
    delete context.vars.patientId;
    
    console.log(`[${new Date().toISOString()}] Cleanup completed for user: ${context.vars.email}`);
    
    return next();
}

// Exportar todas as funções
module.exports = {
    beforeScenario,
    afterScenario,
    processLoginResponse,
    processPatientCreation,
    validateApiResponse,
    generateTestData,
    simulateThinkTime,
    collectCustomMetrics,
    cleanupOnError
};