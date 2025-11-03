const stateBeverages = {
  INAN: "Nariyal Pani is popular in Andaman and Nicobar Islands 🥥",
  INTG: "Ambali is a fermented millet drink from Telangana 🌾",
  INAP: "Panakam is a sweet jaggery drink from Andhra Pradesh 🍯",
  INAR: "Apong is a fermented rice drink from Arunachal Pradesh 🍶",
  INAS: "Xaj is a traditional rice beer from Assam 🍚",
  INBR: "Sattu Sharbat is a protein-rich drink from Bihar 🥣",
  INCH: "Lassi is popular in Chandigarh 🥛",
  INCT: "Mahua Drink is a traditional healthy beverage from Chhattisgarh 🌼",
  INDH: "Chaas is a cooling buttermilk from Dadra and Nagar Haveli and Daman and Diu 🧊",
  INDL: "Masala Chaai is common in Delhi 🥤",
  INGA: "Solkadhi is a cooling kokum drink from Goa 🌺",
  INGJ: "Aam Panna is a summer drink from Gujarat 🥭",
  INHR: "lassi and chaas is very common in Haryana 🥛",
  INHP: "Chhang is a barley-based drink from Himachal Pradesh 🍺",
  INJH: "Handia is a rice-based tribal drink from Jharkhand 🌾",
  INKA: "Majjige is a spiced buttermilk from Karnataka 🧂",
  INKL: "Sambharam is a traditional buttermilk from Kerala 🌿",
  INMP: "Sattu is used in various drinks in Madhya Pradesh 🥤",
  INMH: "Solkadhi is a refreshing drink from Maharashtra 🌸",
  INMN: "Yu is a fermented drink from Manipur 🍶",
  INML: "Kyat is a local rice beer from Meghalaya 🍚",
  INMZ: "Zawlaidi is a grape wine from Mizoram 🍇",
  INNL: "Zutho is a rice beer from Nagaland 🍶",
  INOR: "Pakhala with buttermilk is popular in Odisha 🥛",
  INPY: "Neer Mor is popular in Puducherry 🌊",
  INPB: "Lassi is the pride of Punjab 🥤",
  INRJ: "Chaas is a must-have in Rajasthan heat 🥵",
  INSK: "Chhaang is also popular in Sikkim 🍶",
  INTN: "Neer Mor is a traditional spiced buttermilk from Tamil Nadu 🧂",
  INTR: "Apong-like drinks are found in Tripura 🍚",
  INUP: "Thandai is a nutty milk drink from Uttar Pradesh 🌰",
  INUT: "Buransh (rhododendron) juice is popular in Uttarakhand 🌸",
  INWB: "Gondhoraj Ghol is a lime drink from West Bengal 🍋",
  INLD: "Tender Coconut Water is the go-to drink in Lakshadweep 🥥",
  INJK: "Kahwa is a traditional saffron tea from Jammu and Kashmir ☕",
  INLA: "Gur Gur Chai is a butter tea from Ladakh 🧈"
};

document.addEventListener("DOMContentLoaded", () => {
  // ✅ CORRECTED: This selector now only targets the visible state paths.
  const states = document.querySelectorAll("svg #features path[id^='IN']");

  states.forEach(el => {
    el.addEventListener("click", () => {
      const stateId = el.id;
      const message = stateBeverages[stateId] || `No beverage info available for ${stateId}`;
      showBeverageInfo(message);
    });

    el.addEventListener("mouseover", () => {
      el.style.fill = "#ffcc00";
    });

    el.addEventListener("mouseout", () => {
      el.style.fill = "";
    });
  });
});

function showBeverageInfo(message) {
  let infoBox = document.getElementById("info-box");

  if (!infoBox) {
    infoBox = document.createElement("div");
    infoBox.id = "info-box";
    document.body.appendChild(infoBox);
  }

  infoBox.textContent = `🍹 ${message}`;
  infoBox.style.display = "block";
}