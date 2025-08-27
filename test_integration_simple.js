// Script para testar integração frontend-backend
// Execute no console do navegador (F12)

console.log('🚀 Testando integração DataClinica');

// Teste 1: Verificar se a API está acessível
async function testAPI() {
    try {
        console.log('📡 Testando conectividade da API...');
        const response = await fetch('/api/docs');
        if (response.ok) {
            console.log('✅ API acessível');
            return true;
        } else {
            console.log('❌ API não acessível:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro ao conectar com API:', error);
        return false;
    }
}

// Teste 2: Fazer login
async function testLogin() {
    try {
        console.log('🔐 Testando login...');
        const formData = new FormData();
        formData.append('username', 'admin@dataclinica.com.br');
        formData.append('password', 'admin123');
        
        const response = await fetch('/api/token', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login realizado com sucesso');
            console.log('🔑 Token:', data.access_token.substring(0, 20) + '...');
            return data.access_token;
        } else {
            console.log('❌ Erro no login:', response.status);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro ao fazer login:', error);
        return null;
    }
}

// Teste 3: Listar pacientes
async function testPatients(token) {
    try {
        console.log('👥 Testando listagem de pacientes...');
        const response = await fetch('/api/patients', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const patients = await response.json();
            console.log('✅ Pacientes carregados:', patients.length);
            console.log('📋 Primeiros pacientes:', patients.slice(0, 3));
            return patients;
        } else {
            console.log('❌ Erro ao carregar pacientes:', response.status);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro ao carregar pacientes:', error);
        return null;
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🔄 Iniciando testes de integração...');
    
    const apiOk = await testAPI();
    if (!apiOk) {
        console.log('❌ Testes interrompidos - API não acessível');
        return;
    }
    
    const token = await testLogin();
    if (!token) {
        console.log('❌ Testes interrompidos - Login falhou');
        return;
    }
    
    const patients = await testPatients(token);
    if (patients) {
        console.log('🎉 Todos os testes passaram! Integração funcionando.');
    } else {
        console.log('⚠️ Alguns testes falharam.');
    }
}

// Executar automaticamente
runAllTests();

// Também disponibilizar funções individuais
window.testDataClinica = {
    testAPI,
    testLogin,
    testPatients,
    runAllTests
};

console.log('ℹ️ Funções disponíveis em window.testDataClinica');