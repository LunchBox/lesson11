export default function copyToClipboard(event) {
	const elem = event.target;
	const range = document.createRange();
	range.selectNode(elem);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand("copy");
}
