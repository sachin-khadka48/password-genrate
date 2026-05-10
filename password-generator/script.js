function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '@#$%&*';
    
    let characterPool = '';
    if (includeUppercase) characterPool += uppercaseLetters;
    if (includeLowercase) characterPool += lowercaseLetters;
    if (includeNumbers) characterPool += numbers;
    if (includeSymbols) characterPool += specialCharacters;

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = getRandomInt(0, characterPool.length);
        password += characterPool[randomIndex];
    }
    return password;
}

document.getElementById('generate-button').addEventListener('click', function() {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;

    const generatedPassword = generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
    document.getElementById('password-display').textContent = generatedPassword;
});

document.getElementById('copy-button').addEventListener('click', function() {
    const passwordText = document.getElementById('password-display').textContent;
    navigator.clipboard.writeText(passwordText).then(() => {
        alert('Password copied to clipboard!');
    });
});