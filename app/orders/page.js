"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Orders loading error:", error);

        setMessage(
          "Unable to load your orders. Please try again."
        );

        setLoading(false);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Unexpected orders error:", error);

      setMessage(
        "Something went wrong while loading your orders."
      );
    }

    setLoading(false);
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString();
  }

  function getStatusClass(status) {
    switch (status) {
      case "confirmed":
        return "order-status confirmed";

      case "processing":
        return "order-status processing";

      case "delivered":
        return "order-status delivered";

      case "cancelled":
        return "order-status cancelled";

      default:
        return "order-status pending";
    }
  }

  function getOrderNumber(order) {
    if (!order?.id) return "N/A";

    return order.id
      .substring(0, 8)
      .toUpperCase();
  }

  function getMapUrl(order) {
    if (order?.location_url) {
      return order.location_url;
    }

    if (
      order?.latitude !== null &&
      order?.latitude !== undefined &&
      order?.longitude !== null &&
      order?.longitude !== undefined
    ) {
      return `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
    }

    return "";
  }

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-container">

          <div className="orders-loading">

            <div className="loading-icon">
              📦
            </div>

            <h1>My Orders</h1>

            <p>
              Loading your orders...
            </p>

          </div>

        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">

      <section className="orders-container">

        {/* HEADER */}

        <div className="orders-header">

          <div className="orders-title">

            <div className="orders-icon">
              📦
            </div>

            <div>

              <h1>My Orders</h1>

              <p>
                View your previous orders and
                delivery details.
              </p>

            </div>

          </div>

          <a
            href="/"
            className="orders-home-button"
          >
            ← Shop
          </a>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="orders-message">

            <p>
              {message}
            </p>

            {!message.includes("log in") && (
              <button
                type="button"
                onClick={loadOrders}
                className="retry-orders-button"
              >
                Try Again
              </button>
            )}

            {message.includes("log in") && (
              <a
                href="/login"
                className="start-shopping-button"
              >
                Login
              </a>
            )}

          </div>
        )}


        {/* EMPTY ORDERS */}

        {!message && orders.length === 0 && (
          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <a
              href="/#shop"
              className="start-shopping-button"
            >
              Start Shopping
            </a>

          </div>
        )}


        {/* ORDERS LIST */}

        {!message && orders.length > 0 && (
          <div className="orders-list">

            {orders.map((order) => {

              const location =
                order.location || "";

              const mapUrl =
                getMapUrl(order);

              return (
                <article
                  key={order.id}
                  className="order-card"
                >

                  {/* ORDER HEADER */}

                  <div className="order-card-header">

                    <div className="order-heading">

                      <span className="order-label">
                        ORDER
                      </span>

                      <h2>
                        #{getOrderNumber(order)}
                      </h2>

                      <p className="order-date">
                        {formatDate(
                          order.created_at
                        )}
                      </p>

                    </div>

                    <span
                      className={getStatusClass(
                        order.status
                      )}
                    >
                      {order.status ||
                        "pending"}
                    </span>

                  </div>


                  {/* ITEMS */}

                  <div className="order-products">

                    <h3>
                      🛍️ Items Ordered
                    </h3>

                    {Array.isArray(order.items) &&
                    order.items.length > 0 ? (

                      order.items.map(
                        (item, index) => {

                          const itemName =
                            item.name ||
                            item.Name ||
                            "Product";

                          const quantity =
                            Number(
                              item.quantity || 1
                            );

                          const price =
                            Number(
                              item.price ??
                              item.Price ??
                              0
                            );

                          const itemTotal =
                            price * quantity;

                          return (
                            <div
                              className="order-item"
                              key={index}
                            >

                              <div className="order-item-info">

                                <strong>
                                  {itemName}
                                </strong>

                                <span>
                                  Quantity:{" "}
                                  {quantity}
                                </span>

                              </div>

                              <strong className="order-item-price">
                                KES{" "}
                                {itemTotal.toFixed(2)}
                              </strong>

                            </div>
                          );
                        }
                      )

                    ) : (

                      <p className="no-items">
                        No item details available.
                      </p>

                    )}

                  </div>


                  {/* TOTAL */}

                  <div className="order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      KES{" "}
                      {Number(
                        order.total_amount || 0
                      ).toFixed(2)}
                    </strong>

                  </div>


                  {/* DELIVERY LOCATION */}

                  {(location || mapUrl) && (
                    <div className="order-delivery">

                      <h3>
                        📍 Delivery Location
                      </h3>

                      {location && (
                        <p>
                          {location}
                        </p>
                      )}

                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-map-button"
                        >
                          🗺️ Open Delivery Location
                        </a>
                      )}

                    </div>
                  )}


                  {/* ADDITIONAL INFORMATION */}

                  {order.additional_information && (
                    <div className="order-notes">

                      <h3>
                        📝 Additional Information
                      </h3>

                      <p>
                        {
                          order.additional_information
                        }
                      </p>

                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}


        {/* BACK TO SHOP */}

        <a
          href="/"
          className="orders-back-home"
        >
          ← Back to Trinity Family
        </a>

      </section>

    </main>
  );
}
