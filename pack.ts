/*
Start making Packs!
Try out the hello world sample below to create your first build.
*/

// This import statement gives you access to all parts of the Coda Packs SDK.
import * as coda from "@codahq/packs-sdk";

// Interfaces
interface BibleAPIOptions {
  verses: String
  translation?: String
};


class Util {
  // Throws a Coda UserVisibleErrorMessage to the user.
  public static DisplayCodaUserVisibleError(error: Error) {
    if (coda.StatusCodeError.isStatusCodeError(error)) {
      // Cast the error as a StatusCodeError, for better intellisense.
      let statusError = error as coda.StatusCodeError;
      // If the API returned an error message in the body, show it to the user.
      let message = statusError.body?.detail

      if (message) {
        // If the API returned an error message in the body, show it to the user.
        throw new coda.UserVisibleError(message);
      }
    }

    // Bubble up to the user.
    throw new coda.UserVisibleError(error.message);
  }
};


// Bible interface to API.
class Bible {
  public static async getVerses(fetcher, options: BibleAPIOptions) {
    const url = Bible.buildGetURL(options);

    return await fetcher.fetch({
      method: "GET",
      url: url,
    });
  }

  private static buildGetURL(options: BibleAPIOptions): String {
    let url = "https://bible-api.com/";

    if (options.verses) {
      url += options.verses
    } else {
      // Input must contain verses.
      Util.DisplayCodaUserVisibleError(new Error("Must contain verses."));
    }

    // Optional params.
    if (options.translation) {
      url += "?translation=" + options.translation;
    }

    return url;
  }
};


// This line creates your new Pack.
export const pack = coda.newPack();

// Add network domain.
pack.addNetworkDomain("bible-api.com");

// Here, we add a new formula to this Pack.
pack.addFormula({
  // This is the name that will be called in the formula builder.
  // Remember, your formula name cannot have spaces in it.
  name: "Bible",
  description: "Get a passage of the Bible.",

  // If your formula requires one or more inputs, you’ll define them here.
  // Here, we're creating a string input called “name”.
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "verses",
      description: "Verses that you want to pull from the Bible in the format: BOOK+CHAPTER:VERSE,",
    }),

    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "translation",
      description: "The translation of the Bible you want to use. Supported translations can be found at: https://github.com/seven1m/open-bibles#open-bibles. Use 'abbrev' column. ",
      optional: true
    }),
  ],

  // The resultType defines what will be returned in your Coda doc. Here, we're
  // returning a simple text string.
  resultType: coda.ValueType.String,

  // Everything inside this execute statement will happen anytime your Coda
  // formula is called in a doc. An array of all user inputs is always the 1st
  // parameter.
  execute: async function ([verses, taranslation], context) {
    try {
      const response = await Bible.getVerses(context.fetcher, { verses: verses, translation: taranslation });
      let parsed = await response.body;
      return parsed.text;
    } catch (error) {
      Util.DisplayCodaUserVisibleError(error);
    }
  },
});
