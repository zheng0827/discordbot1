const { SlashCommandBuilder, Client, CommandInteractionOptionResolver, CommandInteraction, AutocompleteInteraction ,AutocompleteFocusedOption} = require("discord.js");

class SlashCommand extends SlashCommandBuilder {
  constructor() {
    super();
    this.type = 1;
    return this;
  }
  /**
   * @returns 
   */
  setRun(
    callback = (
      /**
       * 
       * @param {Client} bot 
       * @param {CommandInteraction} interaction 
       * @param {CommandInteractionOptionResolver} options 
       */
      (bot, interaction, options) => { }
      )
  ) {
    this.run = callback;
    return this;
  }

  /**
   * 
   * @returns 
   */
  setAutocompleteRespond(
    callback = (
      /**
       * @param {Client} bot
       * @param {AutocompleteInteraction} interaction 
       * @param {AutocompleteFocusedOption} focused 
       */
      (bot, interaction, focused) => { }
      )
  ) {
    this.autocomplete = callback;
    return this;
  }

  /**
   * 
   * @param {*} category 設置指令類別
   * @returns 
   */
  setCategory(category = "一般") {
    this.category = category;
    return this;
  }
}

module.exports = SlashCommand;