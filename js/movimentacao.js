//MOVIMENTAÇÃO
const movimentacaoForm = document.getElementById('movimentacao-form');
const modalMovimentacao = document.getElementById('modal-movimentacao');
const modalTitulo = document.getElementById('modal-titulo');
const btnFecharModal = document.getElementById('btn-fechar-modal');
//const btnUltimasMovimentacoes = document.getElementById('btn-ultimas-movimentacoes');

//MOVIMENTAÇÃO
/*btnUltimasMovimentacoes.addEventListener('click', () => {
    relatorioTitulo.textContent = 'Últimas 20 Movimentações';
    carregarRelatorio(20); 
    showSection(relatorioSection);
});*/

//MOVIMENTAÇÃO
function abrirModalMovimentacao(id, nome, tipo) {
    modalTitulo.textContent = `Registrar ${tipo === 'ENTRADA' ? 'Entrada' : 'Retirada'} de: ${nome}`;
    
    // Preenche os campos ocultos do formulário do modal
    document.getElementById('mov-produto-id').value = id;
    document.getElementById('mov-tipo').value = tipo;
    
    modalMovimentacao.showModal(); // API nativa do navegador para abrir <dialog>
}

btnFecharModal.addEventListener('click', () => {
    movimentacaoForm.reset();
    modalMovimentacao.close();
});

movimentacaoForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    
    const produtoId = document.getElementById('mov-produto-id').value;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = parseInt(document.getElementById('mov-quantidade').value);
    const observacao = document.getElementById('mov-justificativa').value; 

    // Chama a função do supabase RPC
    const { error } = await client.rpc('registrar_movimentacao_e_atualizar_estoque', {
        produto_id_param: produtoId,
        quantidade_param: quantidade,
        tipo_param: tipo,
        observacao_param: observacao
    });

    if (error) {
        alert('Erro ao registrar movimentação: ' + error.message);
        console.error('Erro na chamada RPC:', error);
    } else {
        movimentacaoForm.reset();
        modalMovimentacao.close();
        carregarProdutos();
    }
});