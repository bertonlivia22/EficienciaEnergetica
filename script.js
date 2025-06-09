// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDWmY9E1ACnKM14xmhteSBOJFoA7IPBFEM",
    authDomain: "eficienciaenergetica-9db4f.firebaseapp.com",
    projectId: "eficienciaenergetica-9db4f",
    storageBucket: "eficienciaenergetica-9db4f.firebasestorage.app",
    messagingSenderId: "218049620846",
    appId: "1:218049620846:web:fb45b24c9774f4b8cbaf7f",
    databaseURL: "https://eficienciaenergetica-9db4f-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Obter referências aos elementos HTML
const aparelhosTableBody = document.getElementById('aparelhos-table-body');
const aparelhoNomeInput = document.getElementById('aparelho-nome');
const aparelhoQuantidadeInput = document.getElementById('aparelho-quantidade');
const aparelhoConsumoInput = document.getElementById('aparelho-consumo');
const aparelhoHorasInput = document.getElementById('aparelho-horas');
const addAparelhoBtn = document.getElementById('add-aparelho-btn');
const inputFormDiv = document.getElementById('input-form');
const showFormBtn = document.querySelector('button[onclick="adicionar()"]');
const precoKwhInput = document.getElementById('preco-kwh'); 
const calcularCustoBtn = document.getElementById('calcular-custo-btn');
const custoTotalDiarioSpan = document.getElementById('custo-total-diario');
const custoTotalMensalSpan = document.getElementById('custo-total-mensal'); 

let totalConsumoWhDia = 0; // Variável para acumular o consumo total em Wh/dia

// --- Função para Exibir Dados ---
const displayAparelhos = (snapshot) => {
    aparelhosTableBody.innerHTML = '';
    totalConsumoWhDia = 0; // Resetar o total a cada exibição

    const precoKwh = parseFloat(precoKwhInput.value) || 0; // Pega o preço do kWh do input, padrão 0 se inválido

    snapshot.forEach((childSnapshot) => {
        const aparelho = childSnapshot.val();
        const row = aparelhosTableBody.insertRow();

        // Calcular Consumo Final em Wh/dia
        const consumoFinalWhDia = aparelho.quantidade * aparelho.consumo * aparelho.horasDeUso;
        totalConsumoWhDia += consumoFinalWhDia; // Acumula o consumo total

        

        // Calcular Custo Diário
        // Converte Wh para kWh (dividir por 1000) e multiplica pelo preço do kWh
        const custoDiario = (consumoFinalWhDia / 1000) * precoKwh;

        row.insertCell().textContent = aparelho.aparelho;
        row.insertCell().textContent = aparelho.quantidade;
        row.insertCell().textContent = aparelho.consumo;
        row.insertCell().textContent = aparelho.horasDeUso;
        row.insertCell().textContent = consumoFinalWhDia.toFixed(2);
        row.insertCell().textContent = `R$ ${custoDiario.toFixed(2)}`; // Exibe o custo diário formatado
    });

    const custoTotalGeral = (totalConsumoWhDia / 1000) * precoKwh;
    custoTotalDiarioSpan.textContent = `R$ ${custoTotalGeral.toFixed(2)}`;

    const custoTotalGeralMensal = custoTotalGeral * 30;
    custoTotalMensalSpan.textContent = `R$ ${custoTotalGeralMensal.toFixed(2)}`;
};

const addAparelho = async () => {
    const nome = aparelhoNomeInput.value.trim();
    const quantidade = parseInt(aparelhoQuantidadeInput.value);
    const consumo = parseInt(aparelhoConsumoInput.value);
    const horasDeUso = parseInt(aparelhoHorasInput.value);

    if (!nome || isNaN(quantidade) || isNaN(consumo) || isNaN(horasDeUso) || quantidade <= 0 || consumo <= 0 || horasDeUso < 0) {
        alert('Por favor, preencha todos os campos corretamente com valores válidos.');
        return;
    }

    try {
        await db.ref("Aparelhos").push({
            aparelho: nome,
            quantidade: quantidade,
            consumo: consumo,
            horasDeUso: horasDeUso,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        alert('Aparelho adicionado com sucesso!');
        aparelhoNomeInput.value = '';
        aparelhoQuantidadeInput.value = '';
        aparelhoConsumoInput.value = '';
        aparelhoHorasInput.value = '';
        inputFormDiv.style.display = 'none';
    } catch (error) {
        console.error('Erro ao adicionar aparelho: ', error);
        alert('Ocorreu um erro ao adicionar o aparelho. Verifique o console para mais detalhes.');
    }
};

// --- Função para mostrar o formulário de entrada ---
function adicionar() {
    const form = document.getElementById("input-form");
    form.style.display = "block";
}

// --- Função para fechar o formulário de entrada ---
function fechar() {
    const form = document.getElementById("input-form");
    form.style.display = "none";
}

// --- Listeners de Eventos ---
addAparelhoBtn.addEventListener('click', addAparelho);
showFormBtn.addEventListener('click', adicionar); 
calcularCustoBtn.addEventListener('click', () => {
    // Quando o botão é clicado, forçamos a re-exibição para recalcular os custos
    db.ref("Aparelhos").once('value', (snapshot) => {
        displayAparelhos(snapshot);
    });
});
precoKwhInput.addEventListener('change', () => { // Listener para quando o preço do kWh mudar
    // Quando o input do preço muda, também forçamos a re-exibição
    db.ref("Aparelhos").once('value', (snapshot) => {
        displayAparelhos(snapshot);
    });
});

db.ref("Aparelhos").on('value', (snapshot) => {
    displayAparelhos(snapshot);
}, (error) => {
    console.error("Erro ao carregar dados do Realtime Database:", error);
});