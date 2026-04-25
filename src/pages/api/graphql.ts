import { createSchema } from "graphql-yoga";

const schema = createSchema({
    typeDefs: `
        type Definition {
            definition: String
        }

        type Meaning {
            partOfSpeech: String
            definitions: [Definition]
            synonyms: [String]
        }

        type WordResult {
            word: String
            meainings: [Meaning]
        }

        type Query {
            define(word: String!): WordResult
        }
    `,

    resolvers: {
        Query: {
            dictionary: async (_, { word }) => {
                const response = await fetch ('https://api.dictionaryapi.dev/api/v2/entries/en/${word}');
                if (!response.ok) {
                    console.log(`Error fetching definition for ${word}: ${response.statusText}`);
                    return null;
                }
                const data = await response.json();
                const entry  = data[0];

                return {
                    word: entry.word,
                    meanings: entry.meanings.map((m: any) => ({
                        partOfSpeech: m.partOfSpeech,
                        definitions: m.definitions.map((d: any) => ({definition: d.definition})),
                        synonyms: m.synonyms.map((s: string) => s)
                    }))
                }
            }
        }
    }
})