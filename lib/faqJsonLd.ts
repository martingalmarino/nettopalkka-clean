export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQData {
  "@context": string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
}

export function generateFaqForMunicipality(municipalityName: string, municipalitySlug: string): FAQItem[] {
  return [
    {
      question: `Kuinka nettopalkka lasketaan ${municipalityName}ssa?`,
      answer: `Nettopalkka lasketaan vähentämällä bruttopalkasta kaikki verot ja maksut. ${municipalityName}ssa sovelletaan kunnallista veroprosenttia, kansallisia veroja ja eläkemaksuja. Laskuri huomioi kaikki nämä tekijät automaattisesti.`
    },
    {
      question: `Sisältääkö laskelma YEL/TyEL maksut ${municipalityName}ssa?`,
      answer: `Kyllä, laskuri huomioi sekä yrittäjien YEL-maksut että työntekijöiden TyEL-maksut ajantasaisilla prosenteilla. Voit valita oman työsuhteesi mukaan oikean laskentatavan.`
    },
    {
      question: `Milloin laskelmat päivitetään ${municipalityName}ssa?`,
      answer: `Veroprosentit ja maksut päivitetään vuosittain Suomen verohallinnon ja Kela:n tietojen mukaisesti. Laskuri käyttää 2025 vuoden veroprosentteja ja maksuja.`
    },
    {
      question: `Mitä tarkoittaa kunnallinen vero ${municipalityName}ssa?`,
      answer: `Kunnallinen vero on paikallinen tulovero, jonka kukin kunta asettaa. ${municipalityName}n kunnallinen veroprosentti vaikuttaa suoraan nettopalkkaasi. Se on yksi pääkomponenteista kokonaisverotuksessasi.`
    },
    {
      question: `Voiko nettopalkka vaihdella ${municipalityName}ssa?`,
      answer: `Nettopalkka voi vaihdella useista syistä: vähennykset, lisäpalkkiot, työmatkavähennykset ja muut verotukselliset tekijät. Laskuri antaa arvion peruspalkasta, mutta lopullinen nettopalkka voi poiketa hieman.`
    },
    {
      question: `Onko ${municipalityName}n laskelma täysin tarkka?`,
      answer: `Laskuri antaa luotettavan arvion nettopalkastasi, mutta lopullinen summa riippuu henkilökohtaisista tekijöistäsi. Suosittelemme tarkistamaan laskelmat verottajan tai palkanlaskentaohjelman kanssa.`
    },
    {
      question: `Mitä vähennyksiä voin tehdä ${municipalityName}ssa?`,
      answer: `Yleisiä vähennyksiä ovat työmatkakulut, ammattimaiset kulut, korkokulut ja lahjoitukset. Laskuriin voit syöttää omat vähennyksesi saadaksesi tarkemman nettopalkan arvion.`
    }
  ];
}

export function generateFaqJsonLd(municipalityName: string, municipalitySlug: string): FAQData {
  const faqs = generateFaqForMunicipality(municipalityName, municipalitySlug);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function generateFaqForProfession(professionName: string): FAQItem[] {
  return [
    {
      question: `Kuinka lasken nettopalkkani ${professionName}na?`,
      answer: `${professionName}n työssä nettopalkka lasketaan vähentämällä bruttopalkasta verot ja maksut. Laskuri huomioi alan tyypilliset vähennykset ja verotukselliset tekijät.`
    },
    {
      question: `Mitkä vähennykset koskevat ${professionName}ta?`,
      answer: `${professionName}n työssä voi olla oikeus työmatkavähennyksiin, ammattimaisiin välineisiin, koulutuskuluihin ja muihin alakohtaisiin vähennyksiin. Tarkista verottajan sivuilta alasi erityispiirteet.`
    },
    {
      question: `Onko ${professionName}lle erityistä verokohtelua?`,
      answer: `Jotkin ammatit saattavat olla oikeutettuja erityisiin verovähennyksiin tai -helpotuksiin. Laskuri käyttää yleisiä veroprosentteja, mutta tarkista mahdolliset alakohtaiset erityisjärjestelyt.`
    },
    {
      question: `Miten lasken YEL/TyEL maksut ${professionName}na?`,
      answer: `YEL-maksut koskevat yrittäjiä ja TyEL-maksut työntekijöitä. ${professionName}n työssä soveltuu yleensä TyEL, ellei ole yrittäjä. Laskuri huomioi molemmat vaihtoehdot.`
    }
  ];
}

export function generateProfessionFaqJsonLd(professionName: string): FAQData {
  const faqs = generateFaqForProfession(professionName);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}
