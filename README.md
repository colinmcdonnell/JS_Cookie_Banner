# JavaScript Cookie Tracker

CDN built for tracking customer UTM data, IP address, user agent, email and mobile.

## Usage

Include the following in project's head:
```html
<head>
  <script type="text/javascript" src="https://{CDN.HOSTNAME}/tracker.min.js"></script>
</head>
```

Getting cookie and updating values:
```javascript
// get cookie by name "cust_tracker"
let cookieObj = getCookie('cust_tracker')

// parse cookie and update values to overwrite
cookieObj = JSON.parse(cookieObj)
cookieObj.mobile = val
createCookie(cookieObj)

// executes API call to update database
processCookie()

// configure input listners to update browser cookie on blur
const inputsToListen = ['email', 'mobile'] // input must have matching ID
listenForInputs(inputsToListen)
```

*In some cases you may need to access methods from window.

## Next Steps
- API Development
  - Built with Node.js/Express
  - Accepts request and returns GUID value if no GUID is present in request
  - If GUID value is in request -> update MySQL database records

- Database Creation
  - MySQL database with a single table COOKIE_DATA

## Contributing
Always remember to minify JS and copy/paste over entire tracker.min.js file.
https://javascript-minifier.com/