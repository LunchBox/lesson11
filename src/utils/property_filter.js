export default function (key, value) {
	if (!key.startsWith("$")) {
		return value;
	}
}
