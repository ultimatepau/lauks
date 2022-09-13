import React, { PureComponent } from 'react';
import JsonToForm from 'json-reactform';
import { Helmet } from 'react-helmet';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import ReactLoading from 'react-loading';

const model = {
  "Komoditas": {
    "type": "text",
    "required": true
  },
  "Area": {
    "type": "select",
    "required": true,
    "options": [ //use static json arry to get options
    ],
  },
  "Ukuran": {
    "type": "select",
    "required": true,
    "options": [ //use static json arry to get options
    ],
  },
  "Harga": {
    "type": "Number",
    "required": true
  },
  "Simpan": { // button submit
    "type": "submit",
  }
}
export default class Home extends PureComponent {
  state = {
    show: false,
    showSuccess: false,
    listUkuran: [],
    listArea: [],
    loadingCreate: false
  }
  componentDidMount() {
    const { actions: { requestDataInit } } = this.props;
    requestDataInit();
  }
  componentWillReceiveProps({ home }) {
    const { listUkuran, listArea, show, loadingCreate } = this.state;

    if (listUkuran.length === 0 && home?.sizes?.data?.length > 0) {
      const { sizes: { data } } = home, arrUkuran = [];
      data.forEach((_) => {
        arrUkuran.push({ label: _.size, value: _.size })
      })
      this.setState({ listUkuran: arrUkuran });
    }

    if (listArea.length === 0 && home?.areas?.data?.length > 0) {
      const { areas: { data } } = home, arrArea = [];
      data.forEach((_) => {
        arrArea.push({ label: `${_.province}, ${_.city}`, value: `${_.province}, ${_.city}` })
      })
      this.setState({ listArea: arrArea });
    }
    if (show && home.create.data) this.setState({ show: false, showSuccess: true })
    if (loadingCreate !== home.create.fetching) {
      document.querySelectorAll('.mb-4')[4].style.display = 'none'
      this.setState({ loadingCreate: home.create.fetching })
    }
  }
  _handleClose = () => {
    const { show } = this.state;
    this.setState({ show: !show })
  }
  _handleSubmit = (value) => {
    const current = dayjs(), { actions: { postData } } = this.props;
    const payload = {
      uuid: v4(),
      komoditas: value?.Komoditas || '',
      area_provinsi: value?.Area?.value ? value.Area.value.split(',')[0] : '',
      area_kota: value?.Area?.value ? value.Area.value.split(',')[1].trim() : '',
      size: value?.Ukuran.value,
      price: value?.Harga,
      tgl_parsed: current.format('YYYY-MM-DDTHH:mm:ssZ[Z]'),
      timestamp: current.valueOf()
    }
    postData(payload);
  }
  _toggleSuccess = () => {
    const { showSuccess } = this.state;
    this.setState({ showSuccess: !showSuccess }, () => {
      // if (showSuccess) this._getData();
    });
  }
  _renderModalSuccess = () => {
    const { showSuccess } = this.state;
    return (
      <Modal isOpen={showSuccess} toggle={this._toggleSuccess}>
        <ModalHeader toggle={this._toggleSuccess}>Sukses</ModalHeader>
        <ModalBody>
          <p className="msg-success">Sukses menambahkan data</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this._toggleSuccess} color="primary">OK</Button>
        </ModalFooter>
      </Modal>
    )
  }
  _renderModalAdd = () => {
    const { show, loadingCreate } = this.state;
    return (
      <Modal isOpen={show} toggle={this._handleClose}>
        <ModalHeader toggle={this._handleClose}>Tambah Data</ModalHeader>
        <ModalBody>
          <JsonToForm model={model} onSubmit={this._handleSubmit} />
          <div className="col-sm-4 offset-sm-4">
            {loadingCreate && <ReactLoading type="spin" color="#038767" height={38} width={38} />}
          </div>
        </ModalBody>
      </Modal>
    )
  }
  _renderLoading = () => {
    return (
      <div className="loading-overlay">
        <ReactLoading type="spin" color="#038767" height={50} width={50} />
      </div>
    )
  }
  render() {
    const { listUkuran, listArea, loadingCreate } = this.state;
    const clonedModel = Object.assign({}, model);
    if (listUkuran.length > 0) clonedModel.Ukuran.options = listUkuran;
    if (listArea.length > 0) clonedModel.Area.options = listArea;
    return (
      <div className="home-root">
        <Helmet>
          <title>Home</title>
        </Helmet>
        {listArea.length === 0 && listUkuran.length === 0 && this._renderLoading()}
        {this._renderModalAdd()}
        {this._renderModalSuccess()}
        {listArea.length > 0 && listUkuran.length > 0 && (
          <button onClick={this._handleClose} type="button">
            toggle
          </button>
        )}
      </div>
    )
  }
}