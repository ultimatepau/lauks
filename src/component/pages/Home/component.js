import React, { PureComponent } from 'react';
import JsonToForm from 'json-reactform';
import { Helmet } from 'react-helmet';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter, Nav } from 'reactstrap';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import ReactLoading from 'react-loading';
import Navbar from '../../elements/Navbar';
import DataTable from 'react-data-table-component';
import CurrencyFormat from 'react-currency-format';

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

const columns = [
  {
    name: 'Komoditas',
    selector: row => row.komoditas,
    sortable: true,
    sortFunction: (rowA, rowB) => {
      const a = rowA.komoditas.toLowerCase();
      const b = rowB.komoditas.toLowerCase();

      if (a > b) {
          return 1;
      }

      if (b > a) {
          return -1;
      }

      return 0;
    }
  },
  {
    name: 'Harga',
    selector: row => <CurrencyFormat value={row.price} displayType={'text'} thousandSeparator={true} prefix={'Rp. '} />,
    sortable: true,
    sortFunction: (rowA, rowB) => {
      const a = Number(rowA.price);
      const b = Number(rowB.price);

      if (a > b) {
          return 1;
      }

      if (b > a) {
          return -1;
      }

      return 0;
    }
  },
  {
    name: 'Ukuran',
    selector: row => row.size,
    sortable: true
  },
  {
    name: 'Provinsi',
    selector: row => row.area_provinsi,
    sortable: true
  },
  {
    name: 'Kota',
    selector: row => row.area_kota,
    sortable: true
  },
];
export default class Home extends PureComponent {
  state = {
    show: false,
    showSuccess: false,
    listUkuran: [],
    listArea: [],
    loadingCreate: false,
    search: ''
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
  _toggleModalAdd = () => {
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
    const { showSuccess } = this.state, { actions: { getData } } = this.props;
    this.setState({ showSuccess: !showSuccess }, () => {
      if (showSuccess) getData();
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
      <Modal isOpen={show} toggle={this._toggleModalAdd}>
        <ModalHeader toggle={this._toggleModalAdd}>Tambah Data</ModalHeader>
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
  _handleSearch = ({ target: { value: search }}) => {
    this.setState({ search })
  }
  render() {
    const { listUkuran, listArea, search } = this.state;
    const { home } = this.props;
    const clonedModel = Object.assign({}, model);
    if (listUkuran.length > 0) clonedModel.Ukuran.options = listUkuran;
    if (listArea.length > 0) clonedModel.Area.options = listArea;

    let dataFiltered = home?.list?.data?.filter((_) => _.uuid && _.komoditas && _.price && _.size && _.area_kota && _.area_provinsi) || []
    if (search) {
      dataFiltered = dataFiltered.filter(
        (_) => _.komoditas.toLowerCase().includes(search.toLowerCase()) || _.size.includes(search) || _.price.includes(search) || _.area_kota.toLowerCase().includes(search.toLowerCase()) || _.area_provinsi.toLowerCase().includes(search.toLowerCase())
      );
      // console.log(dataFilteredAdvanced)
    }
    return (
      <>
        <Helmet>
          <title>Lauks!</title>
        </Helmet>
        <div className="container">
          <Navbar toggleModalAdd={this._toggleModalAdd} />
          <div className="row">
            <div className="col-10 offset-1 col-md-12 offset-md-0 mt-4">
              <DataTable
                title="Aneka Ikan"
                pagination
                subHeader
                subHeaderComponent={<input value={search} onChange={this._handleSearch} placeholder="Cari data" className="form-control" />}
                columns={columns}
                data={dataFiltered}
                progressPending={home?.list?.fetching}
                progressComponent={
                  <div className="table-loading-container d-flex flex-column justify-content-center align-items-center">
                    <ReactLoading type="spin" color="#038767" height={38} width={38} />
                    <p className="mt-4">Memuat Data ...</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
        {home.list.fetching && listArea.length === 0 && listUkuran.length === 0 && this._renderLoading()}
        {this._renderModalAdd()}
        {this._renderModalSuccess()}
        <footer>
          <p>Yang ngoding <a href="https://github.com/ultimatepau">@ultimatepau</a></p>
        </footer>
      </>
      // <div className="home-root">
      //   {listArea.length > 0 && listUkuran.length > 0 && (
      //     <button onClick={this._toggleModalAdd} type="button">
      //       toggle
      //     </button>
      //   )}
      // </div>
    )
  }
}