project_name: "firestore"

application: firestore {
  label: "Firestore Example"
  url: "https://localhost:8080/dist/bundle.js"
  # file: "bundle.js
  entitlements: {
    external_api_urls : ["https://firestore.googleapis.com","https://identitytoolkit.googleapis.com","https://securetoken.googleapis.com"]
    google_api_scopes: ["https://www.googleapis.com/auth/datastore","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/firebase.database"]
    scoped_user_attributes: ["firebase_config"]
  }
}
