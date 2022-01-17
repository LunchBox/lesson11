import { computed } from "vue";
import Base from "./base.js";

export default class Memo extends Base {
  static modelKey = "memos";

  static attributes = {
    content: { type: "text", default: null },
  }; 
}
