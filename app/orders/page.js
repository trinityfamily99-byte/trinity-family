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
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  function formatStatus(status) {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /*
   * Get the most recent saved delivery location.
   * This prevents the same address from being printed
   * repeatedly for every order.
   */
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const deliveryLocation =
    latestOrder?.location || "";

  const deliveryLocationUrl =
    latestOrder?.location_url ||
    (latestOrder?.latitude !== null &&
    latestOrder?.longitude !== null
      ? `https://www.google.com/maps?q=${latestOrder.latitude},${latestOrder.longitude}`
      : "");

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-container">
          <div className="orders-loading">
            <div className="orders-loading-icon">
              📦
            </div>

            <h1>Loading Your Orders</h1>

            <p>
              Please wait while we retrieve your orders.
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

        <div className="orders-header">

          <div className="orders-title-area">

            <div className="orders-title-icon">
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


        {/* ERROR / MESSAGE */}

        {message && (
          <div className="orders-message">

            <div className="orders-message-icon">
              ⚠️
            </div>

            <div>
              <p>{message}</p>

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


        {/* EMPTY ORDERS */}

        {!message && orders.length === 0 && (
          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>No Orders Yet</h2>

            <p>
              You haven't placed any orders yet.
              Your orders will appear here after
              you complete a purchase.
            </p>

            <a
              href="/#shop"
              className="start-shopping-button"
            >
              Start Shopping
            </a>

          </div>
        )}


        {/* DELIVERY LOCATION */}

        {!message && orders.length > 0 && (
          <>

            {deliveryLocation && (
              <div className="saved-delivery-card">

                <div className="saved-delivery-icon">
                  📍
                </div>

                <div className="saved-delivery-content">

                  <span className="saved-delivery-label">
                    SAVED DELIVERY LOCATION
                  </span>

                  <p>
                    {deliveryLocation}
                  </p>

                </div>

                {deliveryLocationUrl && (
                  <a
                    href={deliveryLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saved-location-button"
                  >
                    🗺️ View Map
                  </a>
                )}

              </div>
            )}


            {/* ORDERS */}

            <div className="orders-section-title">

              <div>
                <h2>Order History</h2>

                <p>
                  {orders.length} order
                  {orders.length !== 1 ? "s" : ""}
                </p>
              </div>

            </div>


            <div className="orders-list">

              {orders.map((order) => {

                const orderMapUrl =
                  order.location_url ||
                  (order.latitude !== null &&
                  order.longitude !== null
                    ? `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
                    : deliveryLocationUrl);

                return (
                  <article
                    key={order.id}
                    className="order-card"
                  >

                    {/* ORDER TOP */}

                    <div className="order-card-header">

                      <div className="order-number-area">

                        <span className="order-small-label">
                          ORDER
                        </span>

                        <h2>
                          #
                          {order.id
                            ? order.id
                                .substring(0, 8)
                                .toUpperCase()
                            : "N/A"}
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
                        {formatStatus(
                          order.status
                        )}
                      </span>

                    </div>


                    {/* ITEMS */}

                    <div className="order-products">

                      <div className="order-section-heading">
                        <span>🛍️</span>
                        <h3>Items Ordered</h3>
                      </div>

                      {Array.isArray(order.items) &&
                      order.items.length > 0 ? (
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

                                <div className="order-item-info">

                                  <strong>
                                    {item.name}
                                  </strong>

                                  <span>
                                    Quantity:{" "}
                                    {item.quantity}
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
                        )
                      ) : (
                        <p className="no-order-items">
                          No item details available.
                        </p>
                      )}

                    </div>


                    {/* TOTAL */}

                    <div className="order-total">

                      <span>
                        Order Total
                      </span>

                      <strong>
                        KES{" "}
                        {Number(
                          order.total_amount || 0
                        ).toFixed(2)}
                      </strong>

                    </div>


                    {/* DELIVERY BUTTON */}

                    {orderMapUrl && (
                      <div className="order-delivery-link">

                        <div>
                          <span className="delivery-mini-icon">
                            📍
                          </span>

                          <div>
                            <strong>
                              Delivery Location
                            </strong>

                            <small>
                              Saved delivery address
                            </small>
                          </div>
                        </div>

                        <a
                          href={orderMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-map-button"
                        >
                          View Map →
                        </a>

                      </div>
                    )}


                    {/* ADDITIONAL INFORMATION */}

                    {order.additional_information && (
                      <div className="order-notes">

                        <strong>
                          📝 Additional Information
                        </strong>

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

          </>
        )}


        {/* BACK */}

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
