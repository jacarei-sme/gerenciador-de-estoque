const movimentacaoForm = document.getElementById('movimentacao-form');
const modalMovimentacao = document.getElementById('modal-movimentacao');
const modalTitulo = document.getElementById('modal-titulo');
const btnFecharModal = document.getElementById('btn-fechar-modal');

let elementoQueAbriuModal = null;

function abrirModalMovimentacao(id, nome, tipo) {

    elementoQueAbriuModal = document.activeElement;

    modalTitulo.textContent = `Registrar ${tipo === 'ENTRADA' ? 'Entrada' : 'Retirada'} de: ${nome}`;
    document.getElementById('mov-produto-id').value = id;
    document.getElementById('mov-tipo').value = tipo;
    
    modalMovimentacao.showModal();
}

btnFecharModal.addEventListener('click', () => {
    movimentacaoForm.reset();
    modalMovimentacao.close();

    if(elementoQueAbriuModal){
        elementoQueAbriuModal.focus();
    }
});

movimentacaoForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    
    const produtoId = document.getElementById('mov-produto-id').value;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = parseInt(document.getElementById('mov-quantidade').value);
    const observacao = document.getElementById('mov-justificativa').value; 

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

        showSection(loadingSection);
        await carregarProdutosComEstoqueZerado();
        showSection(produtosSection);
    }
});