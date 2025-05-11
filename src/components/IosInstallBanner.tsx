import React from 'react';
import styles from './IosInstallBanner.module.css';

// Utility to detect iOS Safari (safe for all browsers)
function isIos() {
    try {
        const ua = window?.navigator?.userAgent || '';
        return (
            /iphone|ipad|ipod/i.test(ua) &&
            /safari/i.test(ua) &&
            !ua.match(/crios|fxios|opera|edgios/i)
        );
    } catch {
        return false;
    }
}

// Utility to check if in standalone mode (safe for all browsers)
function isInStandaloneMode() {
    try {
        // @ts-ignore
        return (window?.navigator?.standalone === true) || (window?.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    } catch {
        return false;
    }
}

export default function IosInstallBanner() {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        try {
            if (isIos() && !isInStandaloneMode()) {
                setShow(true);
            }
        } catch {
            setShow(false);
        }
    }, []);

    if (!show) return null;

    return (
        <div className={styles.iosBanner}>
            <div className={styles.iosBannerContent}>
                <span role="img" aria-label="iOS">📱</span>
                <span>
                    For the best experience, install SubMan on your iPhone: <br />
                    Tap <span className={styles.iosShareIcon}></span>"Share", then <b>Add to Home Screen</b>
                </span>
                <button className={styles.iosBannerClose} onClick={() => setShow(false)} aria-label="Close">×</button>
            </div>
        </div>
    );
}
