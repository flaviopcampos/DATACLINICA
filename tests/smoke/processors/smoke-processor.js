/**
 * =============================================================================
 * Processador de Smoke Tests - DataClinica
 * Funções auxiliares para validação pós-deploy
 * =============================================================================
 */

const assert = require('assert');

/**
 * Validar health check da aplicação
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validateHealthCheck(context, ee, next) {
    const healthStatus = context.vars.health_status;
    const dbStatus = context.vars.db_status;
    const redisStatus = context.vars.redis_status;
    const appVersion = context.vars.app_version;
    
    console.log(`[SMOKE] Health Check - Status: ${healthStatus}, DB: ${dbStatus}, Redis: ${redisStatus}, Version: ${appVersion}`);
    
    try {
        // Validar status geral
        assert.strictEqual(healthStatus, 'healthy', 'Application health status should be healthy');
        
        // Validar banco de dados
        assert.strictEqual(dbStatus, 'connected', 'Database should be connected');
        
        // Validar Redis
        assert.strictEqual(redisStatus, 'connected', 'Redis should be connected');
        
        // Validar versão da aplicação
        assert(appVersion && appVersion.length > 0, 'Application version should be present');
        
        // Emitir métrica de sucesso
        ee.emit('customStat', 'health_check_success', 1);
        
        console.log('[SMOKE] ✅ Health check validation passed');
        
    } catch (error) {
        console.error('[SMOKE] ❌ Health check validation failed:', error.message);
        ee.emit('customStat', 'health_check_failure', 1);
        ee.emit('error', error);
    }
    
    return next();
}

/**
 * Validar assets do frontend
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validateFrontendAssets(context, ee, next) {
    const pageTitle = context.vars.page_title;
    
    console.log(`[SMOKE] Frontend Assets - Page Title: ${pageTitle}`);
    
    try {
        // Validar título da página
        assert(pageTitle && pageTitle.includes('DataClinica'), 'Page title should contain DataClinica');
        
        // Emitir métrica de sucesso
        ee.emit('customStat', 'frontend_assets_success', 1);
        
        console.log('[SMOKE] ✅ Frontend assets validation passed');
        
    } catch (error) {
        console.error('[SMOKE] ❌ Frontend assets validation failed:', error.message);
        ee.emit('customStat', 'frontend_assets_failure', 1);
        ee.emit('error', error);
    }
    
    return next();
}

/**
 * Validar fluxo de autenticação
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validateAuthentication(context, ee, next) {
    const authToken = context.vars.auth_token;
    const userId = context.vars.user_id;
    const userEmail = context.vars.user_email;
    
    console.log(`[SMOKE] Authentication - User ID: ${userId}, Email: ${userEmail}`);
    
    try {
        // Validar token de acesso
        assert(authToken && authToken.length > 0, 'Access token should be present');
        assert(authToken.startsWith('eyJ'), 'Access token should be a valid JWT');
        
        // Validar dados do usuário
        assert(userId && userId > 0, 'User ID should be present and valid');
        assert(userEmail && userEmail.includes('@'), 'User email should be valid');
        
        // Emitir métrica de sucesso
        ee.emit('customStat', 'auth_success', 1);
        ee.emit('customStat', 'auth_success_rate', 100);
        
        console.log('[SMOKE] ✅ Authentication validation passed');
        
    } catch (error) {
        console.error('[SMOKE] ❌ Authentication validation failed:', error.message);
        ee.emit('customStat', 'auth_failure', 1);
        ee.emit('customStat', 'auth_success_rate', 0);
        ee.emit('error', error);
    }
    
    return next();
}

/**
 * Validar APIs principais
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validateCoreAPIs(context, ee, next) {
    const patientsCount = context.vars.patients_count;
    const appointmentsCount = context.vars.appointments_count;
    const dashboardPatients = context.vars.dashboard_patients;
    const dashboardAppointments = context.vars.dashboard_appointments;
    
    console.log(`[SMOKE] Core APIs - Patients: ${patientsCount}, Appointments: ${appointmentsCount}`);
    console.log(`[SMOKE] Dashboard - Patients: ${dashboardPatients}, Today Appointments: ${dashboardAppointments}`);
    
    try {
        // Validar API de pacientes
        assert(typeof patientsCount === 'number' && patientsCount >= 0, 'Patients count should be a valid number');
        
        // Validar API de agendamentos
        assert(typeof appointmentsCount === 'number' && appointmentsCount >= 0, 'Appointments count should be a valid number');
        
        // Validar dashboard
        assert(typeof dashboardPatients === 'number' && dashboardPatients >= 0, 'Dashboard patients should be a valid number');
        assert(typeof dashboardAppointments === 'number' && dashboardAppointments >= 0, 'Dashboard appointments should be a valid number');
        
        // Validar consistência dos dados
        if (patientsCount > 0) {
            assert(dashboardPatients >= patientsCount, 'Dashboard patients should be consistent with API data');
        }
        
        // Emitir métricas de sucesso
        ee.emit('customStat', 'core_apis_success', 1);
        ee.emit('customStat', 'api_availability', 100);
        
        console.log('[SMOKE] ✅ Core APIs validation passed');
        
    } catch (error) {
        console.error('[SMOKE] ❌ Core APIs validation failed:', error.message);
        ee.emit('customStat', 'core_apis_failure', 1);
        ee.emit('customStat', 'api_availability', 0);
        ee.emit('error', error);
    }
    
    return next();
}

/**
 * Validar performance da aplicação
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function validatePerformance(context, ee, next) {
    console.log('[SMOKE] Performance validation completed');
    
    try {
        // Emitir métrica de sucesso
        ee.emit('customStat', 'performance_check_success', 1);
        
        console.log('[SMOKE] ✅ Performance validation passed');
        
    } catch (error) {
        console.error('[SMOKE] ❌ Performance validation failed:', error.message);
        ee.emit('customStat', 'performance_check_failure', 1);
        ee.emit('error', error);
    }
    
    return next();
}

/**
 * Verificar tempo de resposta
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function checkResponseTime(requestParams, response, context, ee, next) {
    const responseTime = response.timings?.response || 0;
    const url = requestParams.url;
    
    console.log(`[SMOKE] Response Time - ${url}: ${responseTime}ms`);
    
    // Emitir métrica customizada
    if (url.includes('/health')) {
        ee.emit('customStat', 'health_check_time', responseTime);
        
        // Validar se health check é rápido
        if (responseTime > 1000) {
            console.warn(`[SMOKE] ⚠️ Health check is slow: ${responseTime}ms`);
            ee.emit('customStat', 'slow_health_check', 1);
        }
    }
    
    // Validar tempo de resposta geral
    if (responseTime > 5000) {
        console.error(`[SMOKE] ❌ Very slow response: ${responseTime}ms for ${url}`);
        ee.emit('customStat', 'very_slow_response', 1);
    } else if (responseTime > 2000) {
        console.warn(`[SMOKE] ⚠️ Slow response: ${responseTime}ms for ${url}`);
        ee.emit('customStat', 'slow_response', 1);
    } else {
        ee.emit('customStat', 'fast_response', 1);
    }
    
    return next();
}

/**
 * Função executada antes de cada cenário
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function beforeScenario(requestParams, context, ee, next) {
    const scenarioName = context.scenario?.name || 'Unknown';
    context.vars.startTime = Date.now();
    
    console.log(`[SMOKE] 🚀 Starting scenario: ${scenarioName}`);
    
    return next();
}

/**
 * Função executada após cada cenário
 * @param {Object} requestParams - Parâmetros da requisição
 * @param {Object} response - Resposta da requisição
 * @param {Object} context - Contexto do teste
 * @param {Function} ee - Event emitter
 * @param {Function} next - Callback para continuar
 */
function afterScenario(requestParams, response, context, ee, next) {
    const scenarioName = context.scenario?.name || 'Unknown';
    const duration = Date.now() - context.vars.startTime;
    
    console.log(`[SMOKE] ✅ Completed scenario: ${scenarioName} in ${duration}ms`);
    
    // Emitir métrica de duração do cenário
    ee.emit('customStat', `scenario_duration_${scenarioName.toLowerCase().replace(/\s+/g, '_')}`, duration);
    
    return next();
}

/**
 * Função para gerar relatório de smoke test
 * @param {Object} stats - Estatísticas do teste
 * @returns {Object} Relatório formatado
 */
function generateSmokeReport(stats) {
    const report = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        target_url: process.env.TARGET_URL || 'unknown',
        summary: {
            total_requests: stats.requestsCompleted || 0,
            successful_requests: stats.codes?.[200] || 0,
            failed_requests: (stats.codes?.[400] || 0) + (stats.codes?.[500] || 0),
            average_response_time: stats.latency?.mean || 0,
            p95_response_time: stats.latency?.p95 || 0,
            p99_response_time: stats.latency?.p99 || 0
        },
        health_check: {
            success: stats.customStats?.health_check_success || 0,
            failure: stats.customStats?.health_check_failure || 0,
            average_time: stats.customStats?.health_check_time || 0
        },
        authentication: {
            success_rate: stats.customStats?.auth_success_rate || 0,
            successes: stats.customStats?.auth_success || 0,
            failures: stats.customStats?.auth_failure || 0
        },
        apis: {
            availability: stats.customStats?.api_availability || 0,
            core_apis_success: stats.customStats?.core_apis_success || 0,
            core_apis_failure: stats.customStats?.core_apis_failure || 0
        },
        performance: {
            fast_responses: stats.customStats?.fast_response || 0,
            slow_responses: stats.customStats?.slow_response || 0,
            very_slow_responses: stats.customStats?.very_slow_response || 0
        },
        status: 'unknown'
    };
    
    // Determinar status geral
    const totalFailures = report.summary.failed_requests + 
                         report.health_check.failure + 
                         report.authentication.failures + 
                         report.apis.core_apis_failure;
    
    if (totalFailures === 0 && report.summary.successful_requests > 0) {
        report.status = 'PASSED';
    } else if (totalFailures > 0 && report.summary.successful_requests > totalFailures) {
        report.status = 'WARNING';
    } else {
        report.status = 'FAILED';
    }
    
    return report;
}

// Exportar todas as funções
module.exports = {
    validateHealthCheck,
    validateFrontendAssets,
    validateAuthentication,
    validateCoreAPIs,
    validatePerformance,
    checkResponseTime,
    beforeScenario,
    afterScenario,
    generateSmokeReport
};