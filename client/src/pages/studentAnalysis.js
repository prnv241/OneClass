import React, { Component } from "react";
import Navbar from "../components/Navbar";
import Button from "@material-ui/core/Button";
import JumboTitle from "../components/JumboTitle";
import { connect } from "react-redux";
import { getSub, uploadSub, submitSub } from "../redux/actions/assgnActions";
import Loading from "../components/Loading";
import "./writtenAssignment.css";
import Loading2 from "../components/logload";
import Graph from "../components/Chart";
import CheckCircle from "@material-ui/icons/CheckCircle";

const mapStateToProps = (state) => ({
  assignments: state.assignments,
  user: state.user,
});

const mapDispatchToProps = {
  getSub,
  uploadSub,
  submitSub,
};

export class WrittenAssignment extends Component {
  //   componentDidMount() {
  //     this.props.getSub(
  //       this.props.match.params.asgnId,
  //       this.props.match.params.id
  //     );
  //   }

  handleEditFile = () => {
    const fileInput = document.getElementById("FileInput");

    fileInput.click();
  };

  handleSubmit = () => {
    var form = {
      userId: this.props.user.id,
      studName: this.props.user.name,
      name: this.props.assignments.submission.name,
      rollno: this.props.user.rollno,
      url: this.props.assignments.url,
    };
    this.props.submitSub(
      form,
      this.props.match.params.asgnId,
      this.props.match.params.id,
      this.props.history
    );
  };

  handleUpload = (event) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("video", file, file.name);
      this.props.uploadSub(formData);
    }
  };
  render() {
    const {
      submission,
      assignment,
      loading: { dloading },
      upload,
      uploading,
    } = this.props.assignments;

    // const complited = assignment.submissions.find(
    //   (as) => as.ref === this.props.match.params.id && as.complited === true
    // );

    // const layout = dloading ? (
    //   <Loading />
    // ) : (
    //   <>
    //     <div className="whole">
    //       <div>Class : 10</div>
    //       <div>Roll No. : 34</div>
    //     </div>
    //     <div className="description">
    //       <div style={{ fontWeight: "bold" }}>Description</div>
    //       <div style={{ marginTop: "1rem" }}>{submission.desc}</div>
    //     </div>
    //     <div className="submit">
    //       <Button
    //         variant="contained"
    //         // disabled={upload || complited}
    //         // onClick={this.handleEditFile}
    //       >
    //         {uploading ? <Loading2 /> : "UPLOAD"}
    //       </Button>{" "}
    //       {upload || complited ? (
    //         <CheckCircle style={{ fill: "#00cc33" }} />
    //       ) : null}
    //       <input
    //         type="file"
    //         id="FileInput"
    //         hidden="hidden"
    //         onChange={this.handleUpload}
    //       />
    //       <Button
    //         variant="contained"
    //         color="primary"
    //         onClick={this.handleSubmit}
    //         disabled={!upload || complited}
    //       >
    //         SUBMIT
    //       </Button>
    //     </div>
    //   </>
    // );
    return (
      <>
        <Navbar />
        <JumboTitle title={"Pranav"} />
        <div className="whole">
          <div>Class : 10</div>
          <div>Roll No. : 34</div>
        </div>
        <div className="whole">
          <div>Predicted Grade : A</div>
          <div>Average Score : 88</div>
        </div>
        {/* {layout} */}
        <Graph />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WrittenAssignment);
