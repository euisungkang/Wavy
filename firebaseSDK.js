const admin = require("firebase-admin");
const fs = require('node:fs')
const { DBAuth } = require('./config.json')

admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(Buffer.from(DBAuth, "base64").toString("ascii"))
    ),
  });

let db = admin.firestore();

async function getMarketMessage() {
    let meta = await db.collection('market').doc('meta')

    const doc = await meta.get()

    if (doc.exists)
        return doc.data().message

    return false
}

async function updateMarketMessage(msg) {
    let meta = await db.collection('market').doc('meta')

    await meta.update({
        message: msg
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Market Message");
    }).catch(err => {
        console.log("Error: " + err);
    })
}

async function getLDBHistoryMessage() {
    let meta = await db.collection('leaderboards').doc('meta')
    const doc = await meta.get()

    if (doc.exists)
        return doc.data().history
    
    return false
}

async function updateLDBHistoryMessage(msg) {
    let meta = await db.collection('leaderboards').doc('meta')

    await meta.update({
        history: msg
    }).then(() => {
        console.log("[DATABASE] Document written successfully: LDB History Message")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getLDBBadgeMessage() {
    let meta = await db.collection('leaderboards').doc('meta')
    const doc = await meta.get()

    if (doc.exists)
        return doc.data().badge
    
    return false
}

async function updateLDBBadgeMessage(msg) {
    let meta = await db.collection('leaderboards').doc('meta')

    await meta.update({
        badge: msg
    }).then(() => {
        console.log("[DATABASE] Document written successfully: LDB Badge Message")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getLDBBoostMessage() {
    let meta = await db.collection('leaderboards').doc('meta')
    const doc = await meta.get()

    if (doc.exists)
        return doc.data().boost

    return false
}

async function updateLDBBoostMessage(msg) {
    let meta = await db.collection('leaderboards').doc('meta')

    await meta.update({
        boost: msg
    }).then(() => {
        console.log("[DATABASE] Document written successfully: LDB Boost Message")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function walletStatus(id) {
    let wallets = db.collection('wallets').doc(id)
    const doc = await wallets.get()

    if (!doc.exists) 
        return false
    if (doc.data().status == undefined) {
        await wallets.update({
            status: true
        }).then(() => {
            console.log("[DATABASE] Document written successfully: Wallet Status unknown, set to true")
        }).catch(err => {
            console.log("Error: " + err)
        })

        return true
    }

    await wallets.update({
        status: !doc.data().status
    }).then(() => {
        console.log("[DATABASE] Document written successfully: !status set")
    }).catch(err => {
        console.log("Error: " + err)
    })

    return true
}

async function getTopWallets(members) {
    const wallets = await db.collection('wallets').get();
    let walletmap = new Map();

    await wallets.docs.map(doc => {
      //King wavy
      //console.log(typeof doc.data().history)
      if(doc.data().userID != '813021543998554122') 
        walletmap.set(doc.data().userID, doc.data().history);
    })

    const sorted = new Map([...walletmap.entries()].sort((a, b) => b[1] - a[1]));
    //console.log(sorted)

    let i = 0
    for (const [key,] of sorted) {
        if (i == 9)
            break
        // console.log(key)
        let member = await members.fetch(key, { force: true }).catch(err => {
            console.log("User does not exist: " + key + "\nRemoved from Leaderboards")
            return null
        })
        if (member == null)
            sorted.delete(key)

        i++
    }

    let finalMap = new Map()
    let sliced = [...sorted.keys()].slice(0, 9)
    await sliced.forEach(k => {
        finalMap.set(k, sorted.get(k))
    })
                 
    return finalMap;
}

async function getProducts() {
  const products = await db.collection('products').get();
  let productArray = [];

  await products.docs.map(doc => {
    productArray.push(doc.data())
  })

  return productArray;
}

async function getCurrency(id) {
  let user = db.collection('wallets').doc(id);

  const doc = await user.get();
  if (doc.exists) {
      return doc.data().currency;
  }

  return 0;
}

async function getCum(id) {
    let user = db.collection("wallets").doc(id);
  
    const doc = await user.get();
    if (doc.exists) {
      return doc.data().cum;
    }
  
    return 0;
}

async function addCurrency(user, amount) {
  let id = user.id
  let name = user.username

  console.log("ID: " + id + "    name:" + name + "    amount: " + amount);

  let userDB = db.collection('wallets').doc(id);
  let aggregate_amount;
  let history = 0

  const doc = await userDB.get();
  if (doc.exists) {
      aggregate_amount = doc.data().currency + amount;
      history = doc.data().history + amount
      console.log(doc.data());
  }

  await userDB.update({
      userID: id,
      name: name,
      currency: aggregate_amount,
      history: history
  }).then(() => {
      console.log("[DATABASE] Document written successfully");
  }).catch(err => {
      console.log("Error: " + err);
  })
};

async function removeCurrency(user, amount) {
  let id = user.id
  let name = user.username

  let userDB = db.collection('wallets').doc(id);
  let aggregate_amount;

  const doc = await userDB.get();
  if (doc.exists) {
      aggregate_amount = doc.data().currency - amount;
      console.log(doc.data());
  }

  await userDB.update({
      userID: id,
      name: name,
      currency: aggregate_amount
  }).then(() => {
      console.log("[DATABASE] Document written successfully");
  }).catch(err => {
      console.log("Error: " + err);
  })
}

async function removeCum(user, amount) {
    let id = user.id
    let name = user.username

    let userDB = db.collection('wallets').doc(id);
    let aggregate_amount;

    const doc = await userDB.get()
    if (doc.exists) {
        aggregate_amount = doc.data().cum - amount;
    }

    await userDB.update({
        userID: id,
        name: name,
        cum: aggregate_amount
    }).then(() => {
        console.log("[DATABASE] Document written successfully")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedNicknames() {
  const products = await db.collection('market').doc('nickname')

  const doc = await products.get()

  return doc.data().restricted
}

async function updateRestrictedNicknames(res) {
    let userDB = db.collection('market').doc('nickname')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Restricted Nicknames")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedServerName() {
    let userDB = db.collection('market').doc('servername')
    let doc = await userDB.get()

    return doc.data().restricted
}

async function updateRestrictedServerName(res) {
    let userDB = db.collection('market').doc('servername')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Server Name")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getRestrictedServerIcon() {
    let userDB = db.collection('market').doc('servericon')
    let doc = await userDB.get()

    return doc.data().restricted
}

async function updateRestrictedServerIcon(res) {
    let userDB = db.collection('market').doc('servericon')

    await userDB.update({
        restricted: res
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Server Icon")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getAllBadges() {
    let userDB = db.collection('market').doc('badges')
    const doc = await userDB.get()
    let badges = doc.data().badges

    const sorted = new Map((Object.entries(badges).sort((a, b) => b[1].length - a[1].length)))

    return sorted
}

async function getBadges(id) {
    let userDB = db.collection('market').doc('badges')
    
    const doc = await userDB.get()

    return doc.data().badges[id]
}

async function updateBadges(id, badge) {
    let userDB = db.collection('market').doc('badges')

    const doc = await userDB.get()

    let badges = await doc.data().badges

    let newBadge = {
        id: badge.id,
        name: badge.name,
        color: badge.color,
    }

    if (!badges.hasOwnProperty(id))
        badges[id] = [newBadge]
    else
        badges[id].push(newBadge)

    await userDB.update({
        badges: badges
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Badge")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function editBadges(id, bs) {
    let userDB = db.collection('market').doc('badges')
    const doc = await userDB.get()

    let badges = await doc.data().badges

    badges[id] = bs

    await userDB.update({
        badges: badges
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Badges Updated (Whole)")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function editRole(id, role) {
    let userDB = db.collection('market').doc('roles')
    const doc = await userDB.get()

    let roles = await doc.data().roles

    roles[id] = role

    await userDB.update({
        roles: roles
    }).then(() => {
        console.log("[DATABASE] Document written succesfully: Custom Role Updated (Whole)")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function updateRoles(id, role, tier) {
    let userDB = db.collection('market').doc('roles')

    const doc = await userDB.get()

    let roles = await doc.data().roles

    let newRole = {
        id: role.id,
        name: role.name,
        color: role.color,
        tier: tier
    }

    roles[id] = newRole

    await userDB.update({
        roles: roles
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Custom Role")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function hasCustomRole(id) {
    let userDB = db.collection('market').doc('roles')
    const doc = await userDB.get()
    let roles = await doc.data().roles
    
    return roles.hasOwnProperty(id)
}

async function getRoyalty() {
    let userDB = db.collection('meta').doc('royalty')
    const doc = await userDB.get()

    return await doc.data().current
}

async function editRoyalty(title, fixed, id) {
    let userDB = db.collection('meta').doc('royalty')
    const doc = await userDB.get()
    let royalty = await doc.data().current

    //console.log("ROYALTY ID: " + royalty[title].id + " == " + id + "\nROYALTY FIXED: " + royalty[title].fixed + " == " + fixed)

    if (royalty.hasOwnProperty(title) && royalty[title].id == id && royalty[title].fixed == fixed)
        return

    royalty[title] = {
        id: id,
        fixed: fixed
    }

    await userDB.update({
        current: royalty
    }).then(() => {
        console.log("[DATABASE] Document written successfully: Royalty Updated")
    }).catch(err => {
        console.log("Error: " + err)
    })
}

async function getAllSubscriptions(id) {
    let userDB = db.collection('market')
    const roles = userDB.doc('roles')
    const badges = userDB.doc('badges')
    const nicknames = userDB.doc('nickname')
    const serverName = userDB.doc('servername')
    const serverIcon = userDB.doc('servericon')

    let toReturn = new Map()

    let doc = await roles.get()
    let purchasedRoles = await doc.data().roles
    if (purchasedRoles.hasOwnProperty(id))
        toReturn.set(purchasedRoles[id].tier - 1, purchasedRoles[id])

    doc = await badges.get()
    let purchasedBadges = await doc.data().badges

    if (purchasedBadges.hasOwnProperty(id))
        toReturn.set(4, purchasedBadges[id])

    doc = await nicknames.get()
    let restrictedNicknames = await doc.data().restricted
    if (restrictedNicknames.hasOwnProperty(id))
        toReturn.set(5, restrictedNicknames[id])

    doc = await serverIcon.get()
    let restrictedIcon = await doc.data().restricted
    if (restrictedIcon.hasOwnProperty(id))
        toReturn.set(6, restrictedIcon)

    doc = await serverName.get()
    let restrictedName = await doc.data().restricted
    if (restrictedName.hasOwnProperty(id))
        toReturn.set(7, restrictedName)   

    return toReturn
}

async function getRolePositions() {
    let userDB = db.collection('market').doc('meta')
    const doc = await userDB.get()
    let roles = await doc.data().rolePositions

    return roles
}

async function getAllWallets() {
    let userDB = await db.collection('wallets').get()
    return userDB.docs.map(doc => doc.data())
}

async function checkNotif(id) {
    const notif = db.collection("notification").doc(id);
  
    const doc = await notif.get();
    if (doc.exists) return false;
    else return true;
}

async function setTimeJoined(m) {
    let time = new Date();
  
    console.log(
      "User: " + m.username + " of ID: " + m.id + " joined VC at " + time
    );
  
    let user = db.collection("wallets").doc(m.id);
  
    const doc = await user.get();
    if (!doc.exists) {
      await user
        .set({
          userID: m.id,
          name: m.username,
          currency: 0,
          cum: 0,
          history: 0,
          time: time,
        })
        .then(() => {
          console.log("Time Added Successfully. User first time");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      await user
        .update({
          time: time,
        })
        .then(() => {
          console.log("Time Added Successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    }
}

async function getTimeJoined(m) {
    let time = new Date();
  
    console.log(
      "User: " + m.username + " of ID: " + m.id + " left a channel at " + time
    );
  
    let user = db.collection("wallets").doc(m.id);
    const doc = await user.get();
    if (doc.exists && doc.data().time != null) {
      time = doc.data().time.toDate();
    }
  
    await user
      .update({
        time: null,
      })
      .then(() => {
        console.log("Time Removed Successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  
    return time;
}

module.exports = {
    walletStatus : walletStatus,
    getMarketMessage : getMarketMessage,
    updateMarketMessage : updateMarketMessage,
    getLDBHistoryMessage : getLDBHistoryMessage,
    updateLDBHistoryMessage : updateLDBHistoryMessage,
    getLDBBoostMessage : getLDBBoostMessage,
    updateLDBBoostMessage : updateLDBBoostMessage,
    getLDBBadgeMessage : getLDBBadgeMessage,
    updateLDBBadgeMessage : updateLDBBadgeMessage,
    getTopWallets : getTopWallets,
    getProducts : getProducts,
    getCurrency : getCurrency,
    getCum : getCum,
    addCurrency : addCurrency,
    removeCurrency : removeCurrency,
    removeCum : removeCum,
    updateBadges : updateBadges,
    getAllBadges: getAllBadges,
    getBadges : getBadges,
    editBadges : editBadges,
    updateRoles : updateRoles,
    editRole: editRole,
    hasCustomRole : hasCustomRole,
    getRoyalty : getRoyalty,
    editRoyalty : editRoyalty,
    getRestrictedNicknames : getRestrictedNicknames,
    updateRestrictedNicknames : updateRestrictedNicknames,
    getRestrictedServerName : getRestrictedServerName,
    updateRestrictedServerName : updateRestrictedServerName,
    getRestrictedServerIcon : getRestrictedServerIcon,
    updateRestrictedServerIcon : updateRestrictedServerIcon,
    getAllSubscriptions : getAllSubscriptions,
    getRolePositions : getRolePositions,
    getAllWallets : getAllWallets,
    checkNotif : checkNotif,
    setTimeJoined : setTimeJoined,
    getTimeJoined : getTimeJoined,
}