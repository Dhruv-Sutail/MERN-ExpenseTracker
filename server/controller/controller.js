const model = require("../models/model");

async function createCategories(req, res) {
  const Create = new model.Categories({ type: "Investment", color: "#FCBE44" });
  await Create.save(function (err) {
    if (!err) return res.json(Create);
    return res
      .status(400)
      .json({ message: `Error while creating categories ${err}` });
  });
}

async function getCategories(req, res) {
  let data = await model.Categories.find({});
  let filter = await data.map((value) =>
    Object.assign({}, { type: value.type, color: value.color })
  );
  return res.json(filter);
}

async function createTransaction(req, res) {
  if (!req.body) return res.status(400).json("Post Http Data not provided!");
  let { name, type, amount } = req.body;
  const create = await new model.Transaction({
    name,
    type,
    amount,
    date: new Date(),
  });
  create.save(function (err) {
    if (!err) return res.json(create);
    return res
      .status(400)
      .json({ message: `Error while creating transactions ${err}` });
  });
}

async function getTransaction(req, res) {
  let data = await model.Transaction.find({});
  return res.json(data);
}

async function deleteTransaction(req, res) {
  if (!req.body) res.status(400).json({ message: "Request body not Found" });
  await model.Transaction.deleteOne(req.body, function (err) {
    if (!err) res.json("Record Deleted...!");
  })
    .clone()
    .catch(function (err) {
      res.json("Error while deleting Transaction Record");
    });
}

async function getLabels(req, res) {
  model.Transaction.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "type",
        foreignField: "type",
        as: "categories_info",
      },
    },
    {
      $unwind: "$categories_info",
    },
  ])
    .then((result) => {
      let data = result.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            name: v.name,
            type: v.type,
            amount: v.amount,
            color: v.categories_info["color"],
          }
        )
      );
      res.json(data);
    })
    .catch((error) => {
      res.status(400).json("Lookup Collection Error");
    });
}

module.exports = {
  createCategories,
  getCategories,
  createTransaction,
  getTransaction,
  deleteTransaction,
  getLabels,
};
