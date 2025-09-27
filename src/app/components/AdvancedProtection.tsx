'use client';
import { useEffect } from 'react';

export default function AdvancedProtection() {
  useEffect(() => {
    const protections = {
      blockShortcuts: () => {
        const blockedKeys = new Set(['F12', 'I', 'J', 'U', 'S', 'C']);
        document.addEventListener('keydown', (e) => {
          const isDevToolShortcut = 
            (e.ctrlKey || e.metaKey) && 
            (e.shiftKey || e.altKey) && 
            blockedKeys.has(e.key);
          
          if (e.key === 'F12' || isDevToolShortcut) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }, true);
      },

      blockInteractions: () => {
        ['contextmenu', 'selectstart', 'dragstart', 'copy'].forEach(event => {
          document.addEventListener(event, (e) => {
            e.preventDefault();
            return false;
          }, true);
        });
      },

      protectConsole: () => {
        if (typeof console !== 'undefined') {
          const methods = ['log', 'warn', 'error', 'info', 'debug', 'table'];
          methods.forEach(method => {
            console[method] = function() {};
          });
        }
      },

      preventFraming: () => {
        if (window.top !== window.self) {
          window.top.location = window.self.location;
        }
      }
    };

    Object.values(protections).forEach(protection => {
      try {
        protection();
      } catch (e) {}
    });

  }, []);

  return null;
}