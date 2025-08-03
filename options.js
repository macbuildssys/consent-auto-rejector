const log = document.getElementById("log");
function logMsg(msg) {
  log.textContent += msg + "\n";
  log.scrollTop = log.scrollHeight;
}

document.getElementById("test").addEventListener("click", () => {
  log.textContent = "";
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length === 0) {
      logMsg("No active tab found.");
      return;
    }
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: () => {
        // Inject and run CMP detection + rejection from content script (simplified)
        return new Promise((resolve) => {
          // This function is the core detection & reject action, returning a summary:
          function detectAndRejectCMP() {
            // CMP detection adapted from Consent-O-Matic:
            const cmpDetectors = [
              {name:"IAB TCF", test:()=>!!window.__tcfapi},
              {name:"Quantcast", test:()=>!!document.querySelector('iframe[src*="quantcast"]')},
              {name:"OneTrust", test:()=>!!document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk')},
              {name:"Cookiebot", test:()=>!!document.querySelector('#CybotCookiebotDialog')},
              {name:"Usercentrics", test:()=>!!document.querySelector('#usercentrics-root')},
              {name:"TrustArc", test:()=>!!document.querySelector('#truste-consent-track')},
              {name:"CookieYes", test:()=>!!document.querySelector('iframe[src*="cookieyes.com"]')},
              {name:"ConsentManager", test:()=>!!document.querySelector('div[data-cmp-name="consentmanager"]')}
            ];
            const detected = cmpDetectors.find(cmp => cmp.test()) || {name:"Unknown"};

            // Reject logic (simplified, but can be expanded with Consent-O-Matic rules):
            function rejectAll() {
              switch(detected.name) {
                case "IAB TCF":
                  window.__tcfapi('setGdprApplies', 2, () => {});
                  window.__tcfapi('setConsent', 2, () => {});
                  return "Called __tcfapi to reject";
                case "Quantcast":
                  let qBtn = document.querySelector('button[mode="reject"], button[mode="optout"], button[aria-label*="Reject"]');
                  if (qBtn) { qBtn.click(); return "Clicked Quantcast reject button"; }
                  return "Quantcast reject button not found";
                case "OneTrust":
                  let otBtn = document.querySelector('#onetrust-reject-all-handler, #onetrust-reject-btn-handler');
                  if (otBtn) { otBtn.click(); return "Clicked OneTrust reject button"; }
                  return "OneTrust reject button not found";
                case "Cookiebot":
                  let cbBtn = document.querySelector('#CybotCookiebotDialogBodyLevelButtonDecline, #CybotCookiebotDialogBodyButtonDecline');
                  if (cbBtn) { cbBtn.click(); return "Clicked Cookiebot decline button"; }
                  return "Cookiebot decline button not found";
                case "Usercentrics":
                  let ucBtn = document.querySelector('button[data-testid="uc-accept-reject-button-reject"]');
                  if (ucBtn) { ucBtn.click(); return "Clicked Usercentrics reject button"; }
                  return "Usercentrics reject button not found";
                case "TrustArc":
                  let taBtn = document.querySelector('button#truste-consent-track[aria-label="Reject"]');
                  if (taBtn) { taBtn.click(); return "Clicked TrustArc reject button"; }
                  return "TrustArc reject button not found";
                case "CookieYes":
                  let cyBtn = document.querySelector('button[data-testid="cookieyes-reject-button"]');
                  if (cyBtn) { cyBtn.click(); return "Clicked CookieYes reject button"; }
                  return "CookieYes reject button not found";
                case "ConsentManager":
                  let cmBtn = document.querySelector('button[data-cmp-action="reject"]');
                  if (cmBtn) { cmBtn.click(); return "Clicked ConsentManager reject button"; }
                  return "ConsentManager reject button not found";
                default:
                  let defBtn = Array.from(document.querySelectorAll('button, a')).find(el =>
                    /reject|decline|no thanks|deny/i.test(el.textContent));
                  if (defBtn) { defBtn.click(); return "Clicked generic reject button"; }
                  return "No reject button found";
              }
            }

            // Run reject & return summary:
            const result = rejectAll();
            return `CMP detected: ${detected.name}\nAction: ${result}`;
          }

          const summary = detectAndRejectCMP();
          resolve(summary);
        });
      }
    }, (results) => {
      if (results && results[0]?.result) {
        logMsg(results[0].result);
      } else {
        logMsg("Failed to detect or reject CMP.");
      }
    });
  });
});
