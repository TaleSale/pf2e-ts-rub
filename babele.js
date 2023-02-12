Hooks.on('init', () => {

    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'PF2E-TS-RUB',
            lang: 'ru',
            dir: 'compendium'
        });
    }
});
