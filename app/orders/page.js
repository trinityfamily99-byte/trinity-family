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
      console.error(error);

      setMessage(
        "Something went wrong while loading your orders."
      );
    }

    setLoading(false);
  }

  function formatDate(date) {
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

  function getOrderNumber(id) {
    if (!id) return "N/A";

    return id
      .substring(0, 8)
      .toUpperCase();
  }

  if (loading) {
    return (
      <main className="orders-page">

        <section className="orders-container">

          <div className="orders-menu-header">
            <div className="orders-icon">
              📦
            </div>

            <div>
              <h1>My Orders</h1>

              <p>
                View your previous orders
              </p>
            </div>
          </div>

          <div className="orders-loading">
            <div className="loading-icon">
              📦
            </div>

            <h2>Loading Your Orders...</h2>

            <p>
              Please wait while we retrieve
              your orders.
            </p>
          </div>

        </section>

      </main>
    );
  }

  return (
    <main className="orders-page">

      <section className="orders-container">

        {/* PAGE HEADER */}

        <div className="orders-menu-header">

          <div className="orders-icon">
            📦
          </div>

          <div className="orders-title">

            <h1>
              My Orders
            </h1>

            <p>
              View your previous orders
              and delivery details.
            </p>

          </div>

        </div>


        {/* SHOP BUTTON */}

        <a
          href="/"
          className="orders-shop-button"
        >
          ← Back to Shop
        </a>


        {/* MESSAGE */}

        {message && (
          <div className="orders-message">

            <div className="message-icon">
              ⚠️
            </div>

            <div>
              <strong>
                Unable to load orders
              </strong>

              <p>
                {message}
              </p>

              {!message.includes("log in") && (
                <button
                  onClick={loadOrders}
                  className="retry-orders-button"
                >
                  Try Again
                </button>
              )}

            </div>

          </div>
        )}


        {/* NO ORDERS */}

        {!message &&
          orders.length === 0 && (
            <div className="empty-orders">

              <div className="empty-orders-icon">
                📦
              </div>

              <h2>
                No Orders Yet
              </h2>

              <p>
                You haven't placed any
                orders yet.
              </p>

              <a
                href="/#shop"
                className="start-shopping-button"
              >
                🛒 Start Shopping
              </a>

            </div>
          )}


        {/* ORDERS */}

        {!message &&
          orders.length > 0 && (
            <div className="orders-list">

              {orders.map((order) => (

                <article
                  key={order.id}
                  className="order-card"
                >

                  {/* ORDER TOP */}

                  <div className="order-card-top">

                    <div className="order-number">

                      <span className="small-label">
                        ORDER
                      </span>

                      <h2>
                        #{getOrderNumber(
                          order.id
                        )}
                      </h2>

                      <p>
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

                  <div className="order-section">

                    <div className="order-section-title">
                      <span>🛍️</span>

                      <h3>
                        Items Ordered
                      </h3>
                    </div>

                    {Array.isArray(
                      order.items
                    ) &&
                      order.items.map(
                        (item, index) => {

                          const itemTotal =
                            Number(
                              item.price || 0
                            ) *
                            Number(
                              item.quantity || 0
                            );

                          return (
                            <div
                              className="order-item"
                              key={index}
                            >

                              <div className="order-item-details">

                                <strong>
                                  {item.name}
                                </strong>

                                <span>
                                  Quantity:{" "}
                                  {
                                    item.quantity
                                  }
                                </span>

                              </div>

                              <strong className="order-item-price">
                                KES{" "}
                                {itemTotal.toFixed(
                                  2
                                )}
                              </strong>

                            </div>
                          );
                        }
                      )}

                  </div>


                  {/* TOTAL */}

                  <div className="order-total-box">

                    <span>
                      Order Total
                    </span>

                    <strong>
                      KES{" "}
                      {Number(
                        order.total_amount ||
                          0
                      ).toFixed(2)}
                    </strong>

                  </div>


                  {/* DELIVERY */}

                  <div className="order-delivery-box">

                    <div className="delivery-heading">

                      <span>
                        📍
                      </span>

                      <div>
                        <h3>
                          Delivery Details
                        </h3>

                        <small>
                          Saved delivery
                          location
                        </small>
                      </div>

                    </div>


                    {order.location && (
                      <p className="delivery-address">
                        {order.location}
                      </p>
                    )}


                    {(
                      order.location_url ||
                      (
                        order.latitude !== null &&
                        order.longitude !== null
                      )
                    ) && (

                      <a
                        href={
                          order.location_url ||
                          `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="order-map-button"
                      >
                        🗺️ Open Delivery Location
                      </a>

                    )}

                  </div>


                  {/* ADDITIONAL INFORMATION */}

                  {order.additional_information && (

                    <div className="order-notes-box">

                      <div className="notes-heading">
                        📝 Additional Information
                      </div>

                      <p>
                        {
                          order.additional_information
                        }
                      </p>

                    </div>

                  )}

                </article>

              ))}

            </div>
          )}


        {/* BOTTOM SHOP LINK */}

        <a
          href="/"
          className="orders-back-home"
        >
          ← Continue Shopping
        </a>

      </section>

    </main>
  );
}
