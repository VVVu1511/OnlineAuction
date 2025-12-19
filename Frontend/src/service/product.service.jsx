import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/product",
    timeout: 20000
});

instance.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem("token");
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

        // ✅ CHỈ set JSON khi payload KHÔNG phải FormData
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);


export async function getProductsByCategory(categoryId){
    const res = await instance.get(`/getByCat/${categoryId}`);
    if(res.status === 201){
        return res.data;
    } else {
        throw new Error("Error getting products by category");
    }
};

export async function searchProducts(keyword){
    const res = await instance.get("/search", {
        params: {q: keyword}
    });

    if(res.status === 201){
        return res.data;
    } else {
        throw new Error("Error searching products");
    }
};

export async function appendProductDescription(productId, newDescription){
    const res = await instance.put(`/appendDescription/${productId}`, {
        newDescription
    });

    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error append product description");
    }
};

export async function getSellerInfo(productId) {
    const res = await instance.get(`/sellerInfor/${productId}`);
    if (res.status === 201) return res.data;
    throw new Error("Error fetching seller info");
}

export async function getBestBidder(productId) {
    const res = await instance.get(`/bestBidder/${productId}`);
    if (res.status === 201) return res.data;
    throw new Error("Error fetching best bidder");
}

export async function getRelatedProducts(productId) {
    const res = await instance.get(`/related/${productId}`);
    if (res.status === 201 || res.status === 200) return res.data;
    throw new Error("Error fetching related products");
}

export async function getQaHistory(productId) {
    const res = await instance.get(`/Q_A/${productId}`);
    if (res.status === 201 || res.status === 200) return res.data;
    throw new Error("Error fetching Q&A history");
}

export async function checkCanBid(productId) {
    const res = await instance.post("/checkCanBid", {
        product_id: productId,
    });

    if (res.status === 201) {
        return res.data;
    } else {
        throw new Error("Error checking can bid");
    }
}

export async function placeBid(productId, price) {
    const res = await instance.post("/bid", {
        product_id: productId,
        price,
    });

    if (res.status === 201) {
        return res.data;
    } else {
        throw new Error("Error placing bid");
    }
}

export async function addProduct(formData, id) {
    const res = await instance.post(`/add/${id}`, formData);

    if (res.status === 200 || res.status === 201) {
        return res.data;
    } else {
        throw new Error("Error creating product");
    }
}

export async function getMyActiveProducts(id) {
    const res = await instance.get(`/myActiveProducts/${id}`);
    console.log(res);
    
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Error fetching my active products");
}

export async function getMyWonProducts(id) {
    const res = await instance.get(`/myWonProducts/${id}`);
    console.log(res);

    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Error fetching my won products");
}

export async function getTop5NearEnd() {
    const res = await instance.get("/top5NearEnd");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching top5 near end");
}

export async function getTop5BidCounts() {
    const res = await instance.get("/top5BidCounts");

    console.log(res);
    if (res.status === 201) return res.data;
    throw new Error("Error fetching top5 bid counts");
}

export async function getTop5Price() {
    const res = await instance.get("/top5Price");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching top5 price");
}

export async function getAllProducts() {
    const res = await instance.get("/all");
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Error fetching all products");
}

export async function removeProduct(id) {
    const res = await instance.delete(`/${id}`, {
        data: { id } 
    });

    if (res.status === 200) return res.data;
    throw new Error("Remove product failed");
}
