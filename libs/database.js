const fs = require("fs");


class Database {
  /**
   * 
   * @param {String} name 資料庫名字
   * @param {String} path 資料庫路徑
   * @param {String} path 資料庫路徑
   */
  constructor(name = "My_first_database", path = `${__dirname}/database/`) {
    this.name = name;
    this.path = `${path}/${name}.json`

    if (!fs.existsSync(this.path))
      try {
        fs.writeFileSync(this.path, JSON.stringify({}))
      } catch (e) {
        throw new Error("Error when init database '" + name + "' error code:\n" + e.toString())
      };

  }

  set(name = "hello", value = "hi~") {
    try {
      var db = fs.readFileSync(this.path, 'utf-8');
    } catch (e) {
      throw new DBError("Error when read database " + name + " error code:\n" + e)
    }

    var parsed = JSON.parse(db);
    db = null;
    parsed[name] = value
    try { fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2)); } catch (e) { throw new DBError("Error when write data database " + name + " error code:\n" + e) }
    // return the object.
    return parsed;
  }

  remove(name = null, mode = "major") {
    /**
     * mode introduct
     * major - delete the key and value.
     * weak - only set value to null. (keep the key).
     * backup - delete the key and value (like major), but create a backup file.
     * Note I: New mode? backup_weak
     */
    // detect the mode.
    switch (mode) {
      case "major":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // delete the value.
        parsed[name] = undefined;
        // delete the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      case "weak":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // delete the value.
        parsed[name] = null;
        // keep the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      case "backup":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // write the data to backup json
        fs.writeFileSync(this.rawPath + "/backup" + this.name + ".bak.json", JSON.stringify(parsed, null, 2))
        // delete the value.
        parsed[name] = undefined;
        // delete the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      default:
        throw new DBError("Unknown option.");
    }
  }

  get(name = null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // clean the db
    db = null;
    // return the value.
    return parsed[name];
  }
  add(name = null, value = null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // detect if value/parsed value are number, else throw a error.
    if (typeof value !== "number") throw new DBError("Error type for value it should be number");
    // add the value
    parsed[name] = parsed[name] ? parsed[name] + value : 0 + value;
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }

  subtract(name = null, value = null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // detect if value/parsed value are number, else throw a error.
    if (typeof value !== "number") throw new DBError("Error type for value it should be number")
    // add the value
    parsed[name] = parsed[name] ? parsed[name] - value : 0 - value;
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }

  push(name = null, value = null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // if the data not exists, create one (array).
    parsed[name] = parsed[name] || [];
    // push the value
    parsed[name].push(value)
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }

  has(name = null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // clean the db
    db = null;
    // return the statement of database has name.
    return parsed.hasOwnProperty(name);
  }

  extend(name, path = __dirname) {
    // make a new database, and copy old json, if exists, throw a error.
    if (fs.existsSync(path + "/" + name + ".json")) throw new DBError("Old database exists.")
    else fs.writeFileSync(path + "/" + name + ".json", JSON.stringify(this.all(), null, 2));
    return new database(name, path);
  }

  toJSON() {
    var db = fs.readFileSync(this.path, 'utf-8');
    var parsed = JSON.parse(db);
    db = null;
    return parsed;
  }
}

module.exports = Database;