
String.prototype.capitalize = function(){
  return this.charAt(0).toUpperCase() + this.slice(1);
}

Array.prototype.remove = function(obj){
		const idx = this.indexOf(obj);
		if (idx > -1) {
			this.splice(idx, 1);
		}
}
