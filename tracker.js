window.addEventListener('load', processCookie)

/**
 * Load banner
 */
function processCookie() {
  // load styles and make request to get user's IP
  generateCSS()
  fetchIP()

  // set inputs to update browser cookie on blur
  const inputsToListen = ['email', 'mobile']
  listenForInputs(inputsToListen)

  // check if cookie already exists
  let cookieObj = getCookie('cookie_tracker')
  cookieObj = cookieObj ? JSON.parse(cookieObj) : buildEmptyCookieObject()
  const cookieExists = !!cookieObj

  // set authToken from cookie or request authToken from backend
  const authToken = cookieExists ? cookieObj.authToken : ''

  // display banner if cookie doesn't exist
  if (!cookieExists) {
    const bannerElement = document.createElement('div')
    bannerElement.classList.add('cookie-banner')
    bannerElement.id = 'cookieBanner'
    bannerElement.innerHTML +=
      '<div class="banner-container">' +
        '<div class="banner-title">' +
          '<div class="cb-h1">We Use Cookies</div>' +
          '<div class="banner-btn">' +
            '<button class="cb-button" onclick="closeBanner()">Accept</button>' +
          '</div>' +
        '</div>' +
        '<div class="banner-body">' +
          '<p class="cb-paragraph">This website uses cookies to improve our users&apos; experience. Lorem Ipsum of the date of any change. You must make sure the software development community for the entire Package. Program. Each Contributor represents that, except as permitted under Section 2) in object code form.</p>' +
          '<a class="cb-anchor" href="#LinkToPolicy" target="_blank">Read Our Policy</a>' +
        '</div>' +
      '</div>'
    if (bannerElement) {
      document.body.appendChild(bannerElement)
    }
  }

  // post details to backend
  postData(authToken, cookieObj)
}

/**
 * Get cookie from browser storage
 * @param {string} cookieNmae The name of the cookie being requested.
 * @returns {string} The cookie JSON in string form.
 */
function getCookie(cookieName) {
  const name = cookieName + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(';')
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1)
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length)
    }
  }
  // return empty string if cookie does not exist
  return ''
}

/**
 * Create cookie
 * @param {object} cookieObj The cookie and it's current values.
 */
function createCookie(cookieObj) {
  // create cookie expiration
  const currentDate = new Date()
  let expirationTime = currentDate.setTime(
    currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
  )
  expirationTime = new Date(expirationTime)

  // set cookie
  document.cookie =
    'cookie_tracker=' +
    JSON.stringify(cookieObj) +
    ';expires=' +
    expirationTime +
    ';path=/;secure;domain=' +
    location.hostname
}

/**
 * Update cookie
 * @param {string} key The key of the cookie object needing to change.
 * @param {string} value The new value for the key that is being changed.
 */
 function updateCookie(key, value) {
  // find key and update value
  let cookieObj = JSON.parse(getCookie('cookie_tracker'))
  cookieObj[key] = value

  // createCookie
  createCookie(cookieObj)
}

/**
 * Build cookie object
 * @param {string} authToken The authentication token.
 * @param {object} cookieObj The cookie and it's current values.
 * @returns {object} The updated values for the cookie.
 */
function buildCookieObject(authToken, cookieObj) {
  // get URL query string params
  const urlParams = new URLSearchParams(window.location.search)

  // get IP and user agent
  const userIP = sessionStorage.getItem('user_ip')
    ? sessionStorage.getItem('user_ip')
    : cookieObj.userIP
    ? cookieObj.userIP
    : 'IP not found'
  const userAgent = getUserAgent()

  // return cookie object
  return {
    authToken: authToken,
    utmData1: urlParams.get('utm_data1')
      ? urlParams.get('utm_data1')
      : cookieObj.utmData1 || '',
    utmData2: urlParams.get('utm_data2')
      ? urlParams.get('utm_data2')
      : cookieObj.utmData2 || '',
    utmData3: urlParams.get('utm_data3')
      ? urlParams.get('utm_data3')
      : cookieObj.utmData3 || '',
    userIP: userIP,
    userAgent: userAgent,
    email: cookieObj.email 
      ? cookieObj.email 
      : sessionStorage.getItem('user_email') || '',
    mobile: cookieObj.mobile 
      ? cookieObj.mobile 
      : sessionStorage.getItem('user_mobile') || '',
  }
}

/**
 * Build cookie object with empty values
 * @returns {object} The empty cookie object.
 */
function buildEmptyCookieObject() {
  return {
    authToken: '',
    utmData1: '',
    utmData2: '',
    utmData3: '',
    userIP: '',
    userAgent: '',
    email: '',
    mobile: ''
  }
}

/**
 * Post data to API to be stored in database
 * @param {string} authToken The authentication token.
 * @param {object} cookieObj The cookie and it's current values.
 */
 function postData(authToken, cookieObj) {
  // build outbound request object
  const outboundObj = buildCookieObject(authToken, cookieObj)

  // API to post data to
  const postUrl = 'postUrl'

  // post cookie data - response should return authToken value
  fetch(postUrl, {
    method: 'POST',
    body: JSON.stringify(outboundObj)
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        outboundObj.authToken = response.authToken
      }
    })
    .catch((error) => {
      // handle error
      console.log(error)
    })

  // HARDCODING authToken VALUE FOR DEMO
  /* PLEASE REMOVE */
  outboundObj.authToken = 'fakeauthTokenVal'
  /* PLEASE REMOVE */
  
  // create cookie
  createCookie(outboundObj)
}

/**
 * List for email or mobile input change
 * @param {array} inputs The form inputs needing to update the cookie on blur
 */
 function listenForInputs(inputs) {
  inputs.forEach((input) => {
    document.getElementById(input).addEventListener('blur', function () {
      const inputValue = document.getElementById(input).value
      sessionStorage.setItem(`user_${input}`, inputValue)
      updateCookie(input, inputValue)
    })
  })
}

/**
 * Get user's IP address
 */
 function fetchIP() {
  fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then(({ ip }) => {
      sessionStorage.setItem('user_ip', ip)
    })
    .catch((error) => {
      // handle error
      console.log(error)
    })
}

/**
 * Get user agent
 * @returns {string} The user agent being used.
 */
function getUserAgent() {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? 'desktop'
    : 'mobile'
}

/**
 * Close banner
 */
 function closeBanner() {
  const bannerElement = document.getElementById('cookieBanner')
  bannerElement.classList.add('cb-hide')
}

/**
 * Generate styles
 */
function generateCSS() {
  const styles = document.createElement('style')
  styles.innerHTML +=
    '.cookie-banner {' +
      'width: 100%;' +
      'position: fixed;' +
      'bottom: 0;' +
      'left: 0;' +
      'background: #1d2a34;' +
      'font-family: Sans-serif, serif;' +
      'border-radius: 8px 8px 0 0;' +
      'transition: all .5s;' +
      'z-index: 9999;' +
    '}' +
    '.cookie-banner .banner-container {' +
      'padding: 16px;' +
      'max-width: 768px;' +
      'margin: auto;' +
    '}' +
    '.cookie-banner .banner-title {' +
      'display: flex;' +
    '}' +
    '.cookie-banner .banner-title .cb-h1 {' +
      'font-size: 16px;' +
      'color: #fff;' +
    '}' +
    '.cookie-banner .banner-btn {' +
      'text-align: center;' +
      'margin-left: auto;' +
    '}' +
    '.cookie-banner .banner-btn button.cb-button {' +
      'color: #1d2a34;' +
      'font-size: 14px;' +
      'cursor: pointer;' +
      'background: #fff;' +
      'box-shadow: 0 1px 2px #00000040;' +
      'border-radius: 8px;' +
      'width: 100%;' +
      'min-width: 80px;' +
      'height: 40px;' +
      'border: none;' +
      'margin-left: auto;' +
      'text-transform: capitalize;' +
      'min-height: 0px;' +
      'padding: 0px;' +
      'font-weight: normal;' +
    '}' +
    '.cookie-banner .banner-body {' +
      'display: block;' +
      'font-size: 14px;' +
      'margin-bottom: 32px;' +
    '}' +
    '.cookie-banner .banner-body p.cb-paragraph {' +
      'width: 100%;' +
      'margin: 16px 0;' +
      'color: #fff;' +
    '}' +
    '.cookie-banner .banner-body a.cb-anchor {' +
      'color: #fff;' +
      'text-align: right;' +
      'width: 100%;' +
      'max-width: 104px;' +
      'display: flex;' +
      'text-decoration: underline;' +
      'margin-left: auto;' +
    '}' +
    '.cb-hide {' +
      'bottom: -100%;' +
    '}' +
    '@media screen and (min-width: 768px) {' +
      '.cookie-banner .banner-container {' +
        'padding: 32px;' +
        'max-width: 1040px;' +
      '}' +
      '.cookie-banner .banner-btn button.cb-button {' +
        'min-width: 120px;' +
      '}' +
      '.cookie-banner .banner-body {' +
        'margin: 4px 0 32px 0;' +
        'display: flex;' +
      '}' +
      '.cookie-banner .banner-body p.cb-paragraph {' +
        'margin: 4px 12px 0px 0;' +
      '}' +
      '.cookie-banner .banner-body a.cb-anchor {' +
        'display: inline-block;' +
        'margin: auto 0 0 auto;' +
        'max-width: 120px;' +
        'text-align: center;' +
      '}' +
    '}'
  if (styles) document.getElementsByTagName('head')[0].appendChild(styles)
}