HOW  TO TEST



    Create a folder named consent-auto-rejector.

    Save the three files above inside it: manifest.json, content-script.js, and background.js.

    Open Chrome and go to chrome://extensions/.

    Enable "Developer mode" (top right toggle).

    Click "Load unpacked" and select your consent-auto-rejector folder.

    Visit any website you added to consentRules or any site with consent popups.

    Open Console (F12) to see logs and watch consent popups get auto rejected if rules match.
