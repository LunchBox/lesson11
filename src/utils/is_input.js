function isInput(elem) {
	// console.log(elem);
	if (!elem || !(elem instanceof HTMLElement)) {
		return false;
	} else if (["INPUT", "TEXTAREA", "FORM"].includes(elem.tagName)) {
		return true;
	} else if (elem.classList.contains("is-input")) {
		return true;
	} else if (elem.parentNode && elem.parentNode !== document.body) {
		return isInput(elem.parentNode);
	} else {
		return false;
	}
}

export default isInput;
