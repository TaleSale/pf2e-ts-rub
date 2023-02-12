Hooks.on('init', () => {

    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'pf2e-ts-rub',
            lang: 'ru',
            dir: 'compendium'
        });
    }
});
