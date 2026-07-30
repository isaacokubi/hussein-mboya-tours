import i18n
from "i18next";


import {
initReactI18next
}
from "react-i18next";


i18n
.use(
initReactI18next
)

.init({

resources:{


en:{

translation:{


welcome:
"Explore Africa With Us"


}

},


sw:{

translation:{


welcome:
"Gundua Afrika Nasi"


}

}


},


lng:"en",


fallbackLng:"en"


});


export default i18n;