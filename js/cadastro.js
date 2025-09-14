document.getElementById('form-material').addEventListener('submit', function(event) {
    event.preventDefault();
    const material = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        unidade: document.getElementById('unidade').value,
        quantidade: document.getElementById('quantidade').value
    };
    console.log('Material cadastrado:', material);
    alert('Material cadastrado com sucesso! (ver console)');
    this.reset();
});