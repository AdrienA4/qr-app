'use client';
import { useEffect } from 'react';

export default function SourceCodeProtection() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = e.ctrlKey || e.metaKey;

      // All possible source code viewing combinations
      const isSourceCodeShortcut = 
        e.key === 'F12' ||
        e.keyCode === 123 ||
        (ctrlKey && e.shiftKey && e.key === 'I') ||
        (ctrlKey && e.shiftKey && e.key === 'J') ||
        (ctrlKey && e.shiftKey && e.key === 'C') ||
        (ctrlKey && e.key === 'U') ||
        (ctrlKey && e.key === 'S') ||
        (isMac && e.altKey && e.key === 'I') ||
        (isMac && e.altKey && e.key === 'J') ||
        (isMac && e.altKey && e.key === 'C') ||
        (isMac && e.metaKey && e.key === 'U') ||
        (ctrlKey && e.key === '`') ||
        (ctrlKey && e.key === '~') ||
        (e.shiftKey && e.key === 'F7') ||
        (e.key === 'F7') ||
        (ctrlKey && e.shiftKey && e.key === 'K') ||
        (ctrlKey && e.shiftKey && e.key === 'M') ||
        (ctrlKey && e.shiftKey && e.key === 'B') ||
        (ctrlKey && e.shiftKey && e.key === 'E') ||
        (ctrlKey && e.shiftKey && e.key === 'I') ||
        (isMac && e.metaKey && e.altKey && e.key === 'I') ||
        (isMac && e.metaKey && e.altKey && e.key === 'C') ||
        e.key === 'F11' ||
        e.key === 'F8' ||
        e.key === 'F9' ||
        e.key === 'F10' ||
        e.key === 'ContextMenu' ||
        e.keyCode === 93 ||
        e.key === 'PrintScreen' ||
        e.key === 'Snapshot' ||
        (ctrlKey && e.key === 'O') ||
        (ctrlKey && e.key === 'P') ||
        (ctrlKey && e.key === 'F5') ||
        (e.shiftKey && e.key === 'F5') ||
        (e.altKey && e.key === 'M') ||
        (e.altKey && e.key === 'D') ||
        e.key === 'F13' ||
        e.key === 'F14' ||
        e.key === 'F15' ||
        (e.altKey && e.key === 'Numpad1') ||
        (e.altKey && e.key === 'Numpad2') ||
        (e.altKey && e.key === 'Numpad3') ||
        (e.shiftKey && e.key === 'F12') ||
        (e.altKey && e.key === 'F12') ||
        (ctrlKey && e.altKey && e.key === 'I') ||
        (ctrlKey && e.altKey && e.key === 'J') ||
        (ctrlKey && e.shiftKey && e.key === 'D') ||
        (ctrlKey && e.shiftKey && e.key === 'F12') ||
        (e.altKey && e.key === 'F8') ||
        (e.altKey && e.key === 'F9') ||
        (ctrlKey && e.shiftKey && e.key === 'X') ||
        (ctrlKey && e.shiftKey && e.key === 'Z') ||
        (e.key === 'Escape' && e.shiftKey) ||
        (e.key === 'Tab' && e.ctrlKey && e.altKey) ||
        (e.key === 'Enter' && e.ctrlKey && e.shiftKey);

      if (isSourceCodeShortcut) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const warning = document.createElement('div');
        warning.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4444;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          z-index: 10000;
          font-family: Arial, sans-serif;
          font-size: 14px;
        `;
        warning.textContent = 'Source code inspection is disabled';
        document.body.appendChild(warning);

        setTimeout(() => {
          if (document.body.contains(warning)) {
            document.body.removeChild(warning);
          }
        }, 2000);

        return false;
      }
    };

    const disableDevTools = () => {
      const noop = () => {};
      const debug = () => {
        setInterval(() => {
          (function() {
            return false;
          }['constructor']('debugger')['call']());
        }, 50);
      };

      try {
        if (typeof console !== 'undefined') {
          console.log = noop;
          console.warn = noop;
          console.error = noop;
        }
      } catch (e) {}
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);

    disableDevTools();

    let devToolsOpen = false;
    const devToolsCheck = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        devToolsOpen = true;
        window.location.reload();
      }
    };

    setInterval(devToolsCheck, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, []);

  return null;
}