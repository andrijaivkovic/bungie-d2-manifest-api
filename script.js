// Third-party lib imports
const express = require("express");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const morgan = require("morgan");
const sqlite = require("sqlite3-promisify");
const fetch = require("node-fetch");

const fs = require("fs");
const download = require("download");
const AdmZip = require("adm-zip");

// Internal imports
const config = require("./config.js");

const app = express();
const port = config.PORT;

app.use(cors());
app.use(morgan("dev"));

const getManifest = async function () {
  try {
    const response = await fetch(
      "https://www.bungie.net/Platform/Destiny2/Manifest/"
    );

    const data = await response.json();

    const manifestURL = data.Response.mobileWorldContentPaths.en;

    fs.rmdirSync("./manifest", { recursive: true });
    fs.mkdirSync("./manifest");

    fs.writeFileSync(
      "manifest/manifest.zip",
      await download(`https://www.bungie.net${manifestURL}`)
    );

    const zip = new AdmZip("./manifest/manifest.zip");
    zip.extractAllTo("./manifest");

    const manifestFile = fs.readdirSync("./manifest", function (err, files) {
      if (err) {
        console.log(err);
        return;
      }
      return files;
    })[1];

    fs.renameSync(
      `./manifest/${manifestFile}`,
      "./manifest/manifest.content",
      () => console.log("Manifest file renamed!")
    );

    console.log(`Finished downloading and extracting the manifest file!`);
  } catch (error) {
    console.error(`Failed to load the manifest file!`);
  }
};

const queryManifest = async function (definition, id) {
  try {
    const db = new sqlite("./manifest/manifest.content");
    const rows = await db.all(
      `SELECT * FROM ${definition} WHERE id + 4294967296 = ${id} OR id = ${id}`
    );
    return JSON.parse(rows[0].json);
  } catch (error) {
    throw new Error(
      `Incorrect Definition (${definition}) or ID (${id}) Inputed`
    );
  }
};

app.listen(port, async () => {
  console.log("Downloading and extracting the manifest file...");
  await getManifest();
  console.log(`Server ready on port ${port}!`);
});

app.get(
  "/Platform/Destiny2/Manifest/:definition/:id",
  asyncHandler(async (req, res, next) => {
    const definition = req.params.definition;
    const id = req.params.id;

    const data = await queryManifest(`${definition}`, `${id}`);

    res.json({
      Response: data,
    });
  })
);

app.use((req, res, next) => {
  const error = new Error("Endpoint Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = error.message;

  res.status(errorStatus).json({
    Response: {
      message: errorMessage,
      status: errorStatus,
    },
  });
});
