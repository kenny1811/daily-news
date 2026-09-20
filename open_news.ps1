# open_news.ps1 - open the news site in the default browser.
# Called by Windows tasks DailyNews-Open-AM / DailyNews-Open-PM at the view times set in settings.json.
# shell-open via the default browser association - behaves exactly like clicking a link,
# so it lands in the normal Chrome session (direct chrome.exe launch can pick the wrong profile).
Start-Process 'http://localhost:8080/'
