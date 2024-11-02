var pin = 0;
$(() => {  
    new PincodeInput('#pin', {
        count: 4,
        secure: true,
        previewDuration: 500,
        onInput: (value) => {
            pin = value;
            terms();
        }
    });
});

const terms = () => {
    $("#btn").get(0).disabled = !$("#tc").get(0).checked || 
                               pin.length != 4 || 
                               $("#phn").get(0).value > 1e10 || 
                               $("#phn").get(0).value < 1e9;
};

const checkAuth = () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return; // Don't redirect if no token

    fetch(`https://bridge-test-api.herokuapp.com/checklogin`, {
        method: 'get',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "x-access-token": jwt
        },
    })
    .then(resp => resp.json())
    .then(resp => {
        if (window.location.pathname.includes('login.html') && (resp.wait || resp.auth)) {
            window.location.href = "index.html";
        }
        if (!window.location.pathname.includes('login.html') && (!resp.wait && !resp.auth)) {
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        console.error(err);
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = "login.html";
        }
    });
};

// Only run auth check when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth if we're not already handling a redirect
    if (!sessionStorage.getItem('redirecting')) {
        checkAuth();
    }
});

const login = () => {
    sessionStorage.setItem('redirecting', 'true');
    $("#sub").get(0).innerHTML = `<img src="assets/images/Pendulum.gif"><h3>loading ...</h3>`;
    fetch(`https://bridge-test-api.herokuapp.com/consent/${$("#phn").get(0).value}`, {
        method: 'post',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({"pin": pin})
    })
    .then((resp) => resp.json())
    .then((resp) => {
        localStorage.setItem("jwt", resp.token);
        window.location.href = resp.url;
    })
    .catch(err => {
        console.error(err);
        sessionStorage.removeItem('redirecting');
    });
};

// Make functions available globally if needed
window.login = login;
window.terms = terms;
