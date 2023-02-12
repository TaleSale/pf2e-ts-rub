game.settings.register("PF2E-TS-RUB", "useCss", {
    name: "Использовать CSS PF2E-TS-RUB",
    hint: "Если вам мешает разноцветность моего оформления, то вы можете отключить его поставив тут галочку.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
    onChange: (value) => {
        window.location.reload();
      },
    });
    
    const data = {
  styles: settings ? ["styles.css"] : []
};
