/**
 * RECOVERY SCRIPT FOR LEGACY VISITORS
 * 
 * Target: Users who haven't visited in >1 month and are stuck on an ancient 
 * cached index.html that still references this file.
 */

(async function () {
    console.log('Legacy Recovery: Checking for ancient cache...');

    const lastCheck = localStorage.getItem('gt_legacy_reset');
    const hasNewSystem = localStorage.getItem('app_version');

    if (hasNewSystem) {
        // User already has the new system, this script is no longer needed for them.
        console.log('Legacy Recovery: New system detected. Standing down.');
        return;
    }

    // If we are here, the user is likely on a very old build.
    // We force a complete hard-reset of the browser environment for this origin.
    try {
        console.warn('Legacy Recovery: Ancient version detected. Performing hard reset...');
        localStorage.setItem('gt_legacy_reset', Date.now().toString());

        // 1. Unregister all old SWs
        if (navigator.serviceWorker) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) await reg.unregister();
        }

        // 2. Clear all named caches
        if (window.caches) {
            const names = await caches.keys();
            for (let name of names) await caches.delete(name);
        }

        // 3. Force hard reload from server
        console.log('Legacy Recovery: Reset complete. Reloading...');
        window.location.reload(true);
    } catch (e) {
        console.error('Legacy Recovery: Reset failed', e);
    }
})();
