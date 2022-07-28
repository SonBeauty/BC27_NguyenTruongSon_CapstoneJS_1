// Cần call API để lấy danh sách sản phẩm và hiển thị ra giao diện

// Hàm main sẽ được chạy khi ứng dụng được khởi chạy
main();

function main() {
  // B1: Gọi API lấy danh sách sản phẩm
  apiGetProducts().then(function (result) {
    // Tạo biến products nhận kết quả trả về từ API
    var products = result.data;
    // Sau khi đã lấy được data từ API thành công
    // Duyệt mảng data và khởi tạo các đối tượng Product
    for (var i = 0; i < products.length; i++) {
      var product = products[i];
      products[i] = new Product(
        product.id,
        product.name,
        product.price,
        product.image,
        product.description
      );
    }
    // Gọi hàm display để hiển thị danh sách sản phẩm ra giao diện
    display(products);
  });
}

function display(products) {
  let html = "";
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>
          <img src="${product.image}" width="70px" height="70px" />
        </td>
        <td>${product.description}</td>
        <td>
          <button
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#myModal"
            data-type="update"
            data-id="${product.id}"
          >
            Cập Nhật
          </button>
          <button
            class="btn btn-danger"
            data-type="delete"
            data-id="${product.id}"
          >
            Xoá
          </button>
        </td>
      </tr>
    `;
  }
  // DOM tới tbody và innerHTML bằng biến html
  document.getElementById("tblDanhSachSP").innerHTML = html;
}

// Hàm xử lý gọi API thêm sản phẩm
function addProduct() {
  // B1: DOM lấy value
  const name = document.getElementById("TenSP").value;
  const price = document.getElementById("GiaSP").value;
  const image = document.getElementById("HinhSP").value;
  const description = document.getElementById("MoTaSP").value;
  // B2: Khởi tạo đối tượng Product
  const product = new Product(null, name, price, image, description);
  // B3: Gọi API thêm sản phẩm

  apiAddProduct(product)
    .then(function (result) {

      main();
      resetForm();
    })
    .catch(function (error) {
      console.log(error);
    });
}

// Hàm xử lý gọi API xoá sản phẩm
function deleteProduct(productId) {
  apiDeleteProduct(productId)
    .then(function () {
      // Xoá thành công
      main();
    })
    .catch(function (error) {
      console.log(error);
    });
}

// Hàm xử lý gọi API cập nhật sản phẩm
function updateProduct() {
  // B1: DOM lấy value
  const id = document.getElementById("MaSP").value; // hidden input
  const name = document.getElementById("TenSP").value;
  const price = document.getElementById("GiaSP").value;
  const image = document.getElementById("HinhSP").value;
  const description = document.getElementById("MoTaSP").value;

  // B2: Khởi tạo đối tượng Product
  const product = new Product(id, name, price, image, description);

  // B3: Gọi API cập nhật sản phẩm
  apiUpdateProduct(product)
    .then(function (result) {
      main();
      resetForm();
    })
    .catch(function (error) {
      console.log(error);
    });
}

// Hàm xử lý reset form và đóng modal
function resetForm() {
  // Reset form
  document.getElementById("MaSP").value = "";
  document.getElementById("TenSP").value = "";
  document.getElementById("GiaSP").value = "";
  document.getElementById("MoTaSP").value = "";

  // Đóng modal (vì sử dụng bootstrap nên phải tuân theo cách làm của nó)
  $("#myModal").modal("hide");
}

// DOM
document.getElementById("btnThemSP").addEventListener("click", showAddModal);
function showAddModal() {
  // Thay đổi text của modal heading
  document.querySelector(".modal-title").innerHTML = "Thêm sản phẩm";
  document.querySelector(".modal-footer").innerHTML = `
    <button
      class="btn btn-primary"
      data-type="add"
    >
      Thêm
    </button>
    <button
      class="btn btn-secondary"
      data-toggle="modal"
      data-target="#myModal"
    >
      Huỷ
    </button>
  `;
}

// Uỷ quyền lắng nghe event của các button từ thẻ .modal-footer
document.querySelector(".modal-footer").addEventListener("click", handleSubmit);
// Các hàm callback được gọi tới khi event được kích hoạt đồng thời nhận được 1 tham số là đối tượng Event
function handleSubmit(event) {
  var type = event.target.getAttribute("data-type");

  switch (type) {
    case "add":
      addProduct();
      break;
    case "update":
      updateProduct();
      break;
    default:
      break;
  }
}

// Uỷ quyền lắng nghe tất cả event của button Xoá và Cập nhật trong table cho tbody
document
  .getElementById("tblDanhSachSP")
  .addEventListener("click", handleProductAction);

function handleProductAction(event) {
  // Loại button (delete || update)
  const type = event.target.getAttribute("data-type");
  // Id của sản phẩm
  const id = event.target.getAttribute("data-id");

  switch (type) {
    case "delete":
      deleteProduct(id);
      break;
    case "update": {
      // Cập nhật giao diện cho modal và call API get thông tin của sản phẩm và fill lên form
      showUpdateModal(id);
      break;
    }

    default:
      break;
  }
}

// Hàm này dùng để cập nhật giao diện cho modal update và call API lấy chi tiết sản phẩm để hiển thị lên giao diện
function showUpdateModal(productId) {
  // Thay đổi text của modal heading/ modal footer
  document.querySelector(".modal-title").innerHTML = "Cập nhật sản phẩm";
  document.querySelector(".modal-footer").innerHTML = `
    <button
      class="btn btn-primary"
      data-type="update"
    >
      Cập nhật
    </button>
    <button
      class="btn btn-secondary"
      data-dismiss="modal"
    >
      Huỷ
    </button>
  `;

  // Call API để lấy chi tiết sản phẩm
  apiGetProductDetail(productId)
    .then(function (result) {
      // Thành công, fill data lên form
      const product = result.data;
      document.getElementById("MaSP").value = product.id;
      document.getElementById("TenSP").value = product.name;
      document.getElementById("GiaSP").value = product.price;
      document.getElementById("HinhSP").value = product.image;
      document.getElementById("MoTaSP").value = product.description;
    })
    .catch(function (error) {
      console.log(error);
    });
}

// DOM tới input search
document.getElementById("txtSearch").addEventListener("keypress", handleSearch);
function handleSearch(evt) {
  console.log(evt);
  // Kiểm tra nếu key click vào không phải là Enter thì bỏ qua
  if (evt.key !== "Enter") return;

  // Nếu key click vào là Enter thì bắt đầu lấy value của input và get products
  let value = evt.target.value;
  apiGetProducts(value).then(function (result) {
    // Tạo biến products nhận kết quả trả về từ API
    let products = result.data;
    // Sau khi đã lấy được data từ API thành công
    // Duyệt mảng data và khởi tạo các đối tượng Product
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      products[i] = new Product(
        product.id,
        product.name,
        product.price,
        product.image,
        product.description
      );
    }
    // Gọi hàm display để hiển thị danh sách sản phẩm ra giao diện
    display(products);
  });
}
