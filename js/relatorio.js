const relatorioTbody = document.getElementById('relatorio-tbody');
const relatorioTitulo = document.getElementById('relatorio-titulo');
const btnRelatorioCompleto = document.getElementById('btn-relatorio-completo');

async function carregarRelatorio(limite = null) {
    let query = client
        .from('relatorio_completo')
        .select('*')
        .order('created_at', { ascending: false });

    if (limite) {
        query = query.limit(limite);
    }

    const { data, error } = await query;
          
    if (error) {
        console.error('Erro ao carregar relatório:', error);
        alert('Não foi possível carregar o relatório. Verifique se a View "relatorio_completo" foi criada no Supabase.');
        return;
    }

    relatorioTbody.innerHTML = '';

    if (data.length === 0) {
        relatorioTbody.innerHTML = '<tr><td colspan="6">Nenhuma movimentação encontrada.</td></tr>';
        return;
    }

    data.forEach(mov => {
        const dataFormatada = new Date(mov.created_at).toLocaleString('pt-BR');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${mov.produto_nome}</td>
            <td><span class="${mov.tipo === 'ENTRADA' ? 'entrada' : 'saida'}">${mov.tipo}</span></td>
            <td>${mov.quantidade}</td>
            <td>${mov.usuario_nome || 'Usuário não definido'}</td> 
            <td>${mov.justificativa || '-'}</td>
        `;
        relatorioTbody.appendChild(tr);
    });
}

btnRelatorioCompleto.addEventListener('click', async () => {
    relatorioTitulo.textContent = 'Relatório de Movimentações';
    
    showSection(loadingSection);
    await carregarRelatorio();
    showSection(relatorioSection);
});