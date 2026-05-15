const lengthEl = document.getElementById("length");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const specialEl = document.getElementById("special");
const passwordDisplay = document.getElementById("passwordDisplay");
const generateBtn = document.getElementById("generate");

const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUM = "0123456789";
const SPEC = "!@#$%^&*()_+[]{}|;:,.<>?";

function getCryptoRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

function pickRandomChar(str) {
    return str[getCryptoRandomInt(str.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = getCryptoRandomInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function calculateStrength(password, opts) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (opts.uppercase) score++;
    if (opts.lowercase) score++;
    if (opts.numbers) score++;
    if (opts.special) score++;

    if (score <= 2) return { label: "Weak", percent: "25%", color: "#e74c3c" };
    if (score <= 4) return { label: "Medium", percent: "60%", color: "#f39c12" };
    return { label: "Strong", percent: "100%", color: "#2ecc71" };
}

function generatePassword() {
    const length = parseInt(lengthEl.value, 10);
    const opts = {
        uppercase: uppercaseEl.checked,
        lowercase: lowercaseEl.checked,
        numbers: numbersEl.checked,
        special: specialEl.checked
    };

    const pools = [];
    if (opts.uppercase) pools.push(UPPER);
    if (opts.lowercase) pools.push(LOWER);
    if (opts.numbers) pools.push(NUM);
    if (opts.special) pools.push(SPEC);

    if (pools.length === 0) {
        passwordDisplay.textContent = "Select at least one option.";
        strengthBar.style.setProperty("--strength", "0%");
        strengthBar.style.setProperty("--strength-color", "#aaa");
        strengthLabel.textContent = "N/A";
        return;
    }

    // Guarantee at least one character from each selected type
    const guaranteed = pools.map(pool => pickRandomChar(pool));

    const allChars = pools.join("");
    const remainingLength = Math.max(length - guaranteed.length, 0);
    const rest = Array.from({ length: remainingLength }, () => pickRandomChar(allChars));

    const passwordArr = shuffleArray([...guaranteed, ...rest]);
    const password = passwordArr.join("");

    passwordDisplay.textContent = password;

    const strength = calculateStrength(password, opts);
    strengthBar.style.setProperty("--strength", strength.percent);
    strengthBar.style.setProperty("--strength-color", strength.color);
    strengthLabel.textContent = strength.label;
}

generateBtn.addEventListener("click", generatePassword);