import React from 'react';
import styles from './IosInstallBanner.module.css';

// Utility to detect iOS Safari
function isIos() {
    return (
        /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
        /safari/i.test(window.navigator.userAgent) &&
        !window.navigator.userAgent.match(/crios|fxios|opera|edgios/i)
    );
}

// Utility to check if in standalone mode
function isInStandaloneMode() {
    // @ts-ignore
    return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export default function IosInstallBanner() {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        if (isIos() && !isInStandaloneMode()) {
            setShow(true);
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
