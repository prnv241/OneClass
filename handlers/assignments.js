const { db, admin } = require("../util/admin");
const { v4: uuid } = require("uuid");

exports.getAssignInfo = (req, res) => {
  db.collection("assignments")
    .get()
    .then((data) => {
      let assignments = [];
      data.forEach((doc) => {
        assignments.push({
          assgnId: doc.id,
          lessonName: doc.data().metadata.lessonName,
          chaptersCount: doc.data().metadata.chaptersCount,
          videosCount: doc.data().metadata.videosCount,
          quizesCount: doc.data().metadata.quizesCount,
          readingsCount: doc.data().metadata.readingsCount,
          complitedCount: doc.data().metadata.complitedCount,
          complited: doc.data().metadata.complited,
          dueDate: doc.data().metadata.dueDate,
        });
      });
      return res.json(assignments);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getAssgn = (req, res) => {
  let assignment = {};
  db.doc(`/assignments/${req.params.assgnId}`)
    .get()
    .then((doc) => {
      assignment.metadata = doc.data().metadata;
      assignment.lessonId = doc.id;
      assignment.submissions = doc.data().submissions;
      assignment.quizes = doc.data().quizes;
      assignment.chapId = doc.data().chapId;
      res.status(200).json(assignment);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getSub = (req, res) => {
  let submission = {};
  db.doc(`/submissions/${req.params.subId}`)
    .get()
    .then((doc) => {
      submission.name = doc.data().name;
      submission.desc = doc.data().desc;
      res.status(200).json(submission);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.checkResAsgn = (req, res) => {
  var asgnId = req.params.asgnId;
  var ref = req.params.ref;
  var results = {};
  db.doc(`/quizes/${ref}`)
    .get()
    .then((doc) => {
      var questions = doc.data().questions;
      var answers = doc.data().answers;
      var submitted = req.body.quizAns;
      results.noques = questions.length;
      results.nosub = submitted.length;
      var correct = 0;
      submitted.forEach((sub) => {
        let obj = answers.find((o) => o.id === sub.id);
        if (obj.answer === sub.ans) {
          correct = correct + 1;
        }
      });
      results.nocurr = correct;
      results.percent = (correct / questions.length) * 100;
      var ress = { ...results, ...req.body.data };
      db.collection("quizSubs")
        .add(ress)
        .then((doc) => {
          db.doc(`/assignments/${asgnId}`)
            .get()
            .then((asgn) => {
              var dubs;
              dubs = asgn.data().quizes;
              dubs.forEach((quiz) => {
                if (quiz.ref === ref) {
                  quiz.complited.push(req.user.user_id);
                }
              });
              db.doc(`/assignments/${asgnId}`).update({ quizes: dubs });
              return res.json({ success: "Quiz submitted successfully! " });
            })
            .catch((err) => {
              console.error(err);
              return res.status(500).json({ error: err.message });
            });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.message });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "something went wrong" });
    });
};

exports.submitSub = (req, res) => {
  const asgnId = req.params.asgnId;
  const subId = req.params.subId;
  var asgnSub = {
    marks: "",
    name: req.body.name,
    studName: req.body.studName,
    rollno: req.body.rollno,
    url: req.body.url,
    time: Date.now(),
    asgnId: asgnId,
    subId: subId,
    userId: req.body.userId,
  };
  db.collection("asgnSubs")
    .add(asgnSub)
    .then((doc) => {
      var subs;
      db.doc(`/assignments/${asgnId}`)
        .get()
        .then((asgn) => {
          subs = asgn.data().submissions;
          subs.forEach((sub) => {
            if (sub.ref === subId) {
              sub.complited.push(req.user.user_id);
            }
          });
          db.doc(`/assignments/${asgnId}`)
            .update({ submissions: subs })
            .then(() => {
              return res.json(subs);
            })
            .catch((err) => {
              console.error(err);
              return res.status(500).json({ error: err.message });
            });
        });
    });
};

exports.uploadSub = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let FileToBeUploaded = {};
  let FileName;
  let generatedToken = uuid();

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "application/pdf" && mimetype !== "application/msword") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    const FileExtension = filename.split(".")[filename.split(".").length - 1];
    FileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${FileExtension}`;
    const filepath = path.join(os.tmpdir(), FileName);
    FileToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(FileToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: FileToBeUploaded.mimetype,
            firebaseStorageDownloadTokens: generatedToken,
          },
        },
      })
      .then(() => {
        const FileUri = `https://firebasestorage.googleapis.com/v0/b/interndemo-25232.appspot.com/o/${FileName}?alt=media&token=${generatedToken}`;
        return res.json({ fileUrl: FileUri });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });
  busboy.end(req.rawBody);
};

exports.getQuizModule = (req, res) => {
  let module = {};
  const asgnId = req.params.asgnId;
  const ref = req.params.ref;
  db.doc(`/assignments/${asgnId}`)
    .get()
    .then((doc) => {
      module.chapter = {
        metadata: doc.data().metadata,
        lessonId: doc.id,
        submissions: doc.data().submissions,
        quizes: doc.data().quizes,
        chapId: doc.data().chapId,
      };
      return db.doc(`/quizes/${ref}`);
    })
    .then((body) => {
      body
        .get()
        .then((doc) => {
          module.data = doc.data();
          module.data.ref = doc.id;
          module.data.answers = {};
          return res.json(module);
        })
        .catch((err) => {
          res.status(500).json({ error: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getAsgnQuizRes = (req, res) => {
  var ref = req.params.ref;
  var userId = req.params.userId;
  db.collection("quizSubs")
    .where("userId", "==", userId)
    .where("quizId", "==", ref)
    .get()
    .then((data) => {
      console.log(data.docs[0].data());
      var resa = {
        nocurr: data.docs[0].data().nocurr,
        noques: data.docs[0].data().noques,
        nosub: data.docs[0].data().nosub,
        percent: data.docs[0].data().percent,
        quizId: data.docs[0].data().quizId,
        studName: data.docs[0].data().studName,
        userId: data.docs[0].data().userId,
        rollno: data.docs[0].data().rollno,
      };
      return res.json(resa);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.newAsgn = (req, res) => {
  var asgnId = req.params.asgnId;
  var newAsgn = req.body.asgndata;
  db.collection("submissions")
    .add(newAsgn)
    .then((data) => {
      db.doc(`/assignments/${asgnId}`)
        .get()
        .then((doc) => {
          var temp = doc.data().submissions;
          var newsub = {
            name: newAsgn.name,
            complited: [],
            ref: data.id,
            time: newAsgn.time,
          };
          temp.push(newsub);
          db.doc(`/assignments/${asgnId}`)
            .update({ submissions: temp })
            .then((rec) => {
              console.log("Assignment Added!");
              return res.status(200).json(temp);
            });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.message });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.getquizsub = (req, res) => {
  var ref = req.params.id;
  var result = [];
  db.collection("quizSubs")
    .where("quizId", "==", ref)
    .get()
    .then((data) => {
      console.log(data.docs.length);
      data.docs.forEach((doc) => {
        var resa = {
          nocurr: doc.data().nocurr,
          noques: doc.data().noques,
          nosub: doc.data().nosub,
          percent: doc.data().percent,
          quizId: doc.data().quizId,
          studName: doc.data().studName,
          userId: doc.data().userId,
          rollno: doc.data().rollno,
        };
        result.push(resa);
      });
      console.log(result);
      return res.json(result);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.getsubsub = (req, res) => {
  var ref = req.params.id;
  var result = [];
  db.collection("asgnSubs")
    .where("subId", "==", ref)
    .get()
    .then((data) => {
      data.docs.forEach((doc) => {
        var resa = {
          asgnId: doc.data().asgnId,
          userId: doc.data().userId,
          marks: doc.data().marks,
          name: doc.data().name,
          rollno: doc.data().rollno,
          studName: doc.data().studName,
          subId: doc.data().subId,
          time: doc.data().time,
          url: doc.data().url,
        };
        result.push(resa);
      });
      return res.json(result);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.updateMarks = (req, res) => {
  var ref = req.body.ref;
  var userId = req.body.userId;
  var marks = req.body.marks;
  db.collection("asgnSubs")
    .where("userId", "==", userId)
    .where("subId", "==", ref)
    .get()
    .then((data) => {
      var id = data.docs[0].id;
      db.doc(`/asgnSubs/${id}`)
        .update({ marks: marks })
        .then((doc) => {
          db.doc(`/asgnSubs/${id}`)
            .get()
            .then((dc) => {
              return res.json(dc.data());
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.message });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.message });
    });
};

exports.getStudList = (req, res) => {
  var studlist = [];
  db.collection("users")
    .where("role", "==", "Student")
    .get()
    .then((data) => {
      data.docs.forEach((doc) => {
        studlist.push(doc.data());
      });
      return res.json(studlist);
    })
    .catch((err) => console.log(err));
};

exports.getLivelist = (req, res) => {
  var liveList = [];
  db.collection("lives")
    .get()
    .then((data) => {
      data.docs.forEach((doc) => {
        liveList.push(doc.data());
      });
      return res.json(liveList);
    })
    .catch((err) => console.log(err));
};

exports.createLive = (req, res) => {
  var uid = req.body.uid;
  var userId = req.body.userId;
  var name = req.body.name;
  db.collection("lives")
    .add({ uid, userId, name })
    .then((doc) => {
      return res.json({ uid, userId, name });
    })
    .catch((err) => console.log(err));
};
