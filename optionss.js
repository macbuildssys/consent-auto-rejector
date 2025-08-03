// options.js
document.addEventListener('DOMContentLoaded', () =>
  chrome.storage.local.get(['mode'], data => {
    if (data.mode) document.querySelector(`input[value="${data.mode}"]`).checked = true;
  })
);

document.querySelectorAll('input[name="mode"]').forEach(input =>
  input.addEventListener('change', () =>
    chrome.runtime.sendMessage({ action: 'setSettings', settings: { mode: input.value } })
  )
);

document.getElementById('retryBtn').addEventListener('click', () =>
  chrome.runtime.sendMessage({ action: 'retryConsent' }, resp => {
    alert(resp.success ? 'Consent re-run invoked' : `Error: ${resp.error}`);
  })
);
