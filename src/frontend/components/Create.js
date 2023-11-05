import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import { Web3Storage } from "web3.storage";
const client = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDliREE0MDE1ODAxQzJjOThENmY4NTIxNTI5OGYzMEU1MDJkNjZCQTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTkxNjc4NTMzNzIsIm5hbWUiOiJnb29kbmZ0In0.Dk23vaPoVX0-uELsvDdfTF7h_72HmfhTKlvBEwdvKMM",
});

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [fileID, setFileID] = useState(null);
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        console.log(file);
        const cid = await client.put(event.target.files);
        const url = `https://${cid}.ipfs.dweb.link/${event.target.files[0].name}`;
        console.log("stored files with cid:", cid);
        console.log(url);
        setImage(url);
        setFileUrl(url);
        setFileID(url.substring(url.indexOf("/") + 2, url.indexOf(".")));
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    const data = new Blob(
      [JSON.stringify({ name, description, price, image: fileUrl, fileID })],
      { type: "application/json" }
    );
    const files = [new File([data], fileID)];
    try {
      const result = await client.put(files);
      console.log("FILE ID: ", fileID);
      const url = `https://${result}.ipfs.dweb.link/${fileID}`;
      console.log(url);
      mintThenList(url);
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };
  const mintThenList = async (url) => {
    const uri = url;

    console.log(price);
    await (await nft.mint(uri)).wait();
    const id = await nft.tokenCount();
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    const listingPrice = ethers.utils.parseEther(price.toString());
    console.log(listingPrice);
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
