import ActiveRecord from "./active_record.js";
import axios from "axios";

export default class Entry extends ActiveRecord {
	static modelKey = "entries";

	static attributes = {
		title: { type: "string", default: "Untitled" },
		entryItemIds: { type: "array", default: [] },
	};

	get mark() {
		return `@${this.id}`;
	}

  get markdownContent(){
    const res = this.entryItems.map(ei => {
      switch(ei.itemType) {
        case 'Memo':
          return ei.item.content;
        case 'Entry':
          return ei.item.title;
        default: 
          return ei.item.mark;
      }
    });

    res.unshift("# " + this.title);

    return res.join("\r\n\r\n");
  }
  
	get fullPath() {
		return new URL(this.resourcePath, import.meta.env.VITE_API_URL).href;
	}

  get cacheFilename() {
    return this.id + ".md";
  }

  get resourcePath() {
    return `/${this.constructor.modelKey}_cache/${this.cacheFilename}`;
  }

	async fileize() {
		const res = await axios.put(
			`/api${this.resourcePath}`,
			this.markdownContent,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);
    return res;
	}
}
