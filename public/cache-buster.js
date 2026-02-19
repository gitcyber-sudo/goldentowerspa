(function () {
    const VERSION = '1.0.3';
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion !== VERSION) {
        localStorage.clear();
        localStorage.setItem('app_version', VERSION);
        window.location.reload(true);
    }
})();
