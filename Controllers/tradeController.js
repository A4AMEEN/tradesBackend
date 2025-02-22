const Trade = require('../Models/trades'); // Ensure correct path
const Player = require('../Models/player'); // Ensure correct path
const PlayerTrade = require('../Models/playerTrades'); // Ensure correct path
const nodemailer = require('nodemailer');


exports.createTrade = async (req, res) => {
    try {
      // Check if item already exists
      const existingTrade = await Trade.findOne({ itemName: req.body.item });
      if (existingTrade) {
        return res.status(400).json({
          message: "An item with this name already exists",
          error: "Duplicate item name"
        });
      }
  
      const tradeData = {
        itemName: req.body.item,
        quantity: req.body.quantity,
        price: {
          ingot: req.body.priceIngots,
          rs: req.body.priceIRL
        },
        offer: req.body.offer || '',
        stockOut: false,
        // Use Cloudinary URL instead of local path
        img: req.file ? req.file.path : null
      };
  
      const trade = new Trade(tradeData);
      await trade.save();
  
      res.status(201).json({
        message: "Trade created successfully!",
        trade,
      });
    } catch (error) {
      console.error("Trade Save Error:", error);
      res.status(400).json({ error: error.message });
    }
  };

exports.getAllTrades = async (req, res) => {
    console.log("trades");
    
    try {
        const trades = await Trade.find();
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTradeById = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) {
            return res.status(404).json({ message: "Trade not found" });
        }
        res.status(200).json(trade);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTrade = async (req, res) => {
    try {
      const updateData = {
        itemName: req.body.item,
        quantity: req.body.quantity,
        price: {
          ingot: req.body.priceIngots,
          rs: req.body.priceIRL
        },
        offer: req.body.offer || '',
        stockOut: req.body.stockStatus === 'Out of Stock'
      };
  
      // Only update the image if a new file is uploaded
      if (req.file) {
        updateData.img = req.file.path; // Cloudinary URL is stored in req.file.path
      }
  
      console.log(updateData);
  
      const trade = await Trade.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
  
      res.status(200).json({
        message: "Trade updated successfully",
        trade
      });
    } catch (error) {
      console.error("Update Trade Error:", error);
      res.status(400).json({ error: error.message });
    }
  };
exports.toggleTradeStock = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ message: "Trade not found" });
        }

        trade.stockOut = !trade.stockOut;
        await trade.save();

        res.status(200).json({
            message: "Stock status updated successfully",
            trade
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createPlayerTrade = async (req, res) => {
    try {
        const { playerId, tradeId, quantity, paymentMethod, totalPrice } = req.body;

        // Find the trade by ID
        const trade = await Trade.findById(tradeId);
        if (!trade || trade.stockOut || trade.quantity < quantity) {
            return res.status(400).json({ message: "Invalid trade or insufficient stock" });
        }

        // Find the player by ID
        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(400).json({ message: "Player not found" });
        }

        // Check if this is the player's first trade
        const isFirstTrade = player.totalTrades === 0;

        // Apply 50% discount for first-time traders
        const finalPrice = isFirstTrade ? totalPrice / 2 : totalPrice;

        // Conditionally set totalPrice based on payment method
        const totalPriceObj = {
            ingot: paymentMethod === 'ingot' ? finalPrice : 0,
            rs: paymentMethod === 'rs' ? finalPrice : 0,
        };

        // Create a new PlayerTrade document
        const playerTrade = new PlayerTrade({
            playerId,
            tradeId,
            quantity,
            totalPrice: totalPriceObj, // Dynamically set price
            paymentMethod,
            status: 'pending',
            isFirstTrade,
        });

        await playerTrade.save();

        // Update player data (add trade and increment totalTrades)
        await Player.findByIdAndUpdate(playerId, {
            $push: { trades: { tradeId, amount: quantity } },
            $inc: { totalTrades: 1 },
        });
        console.log("playerTrade",playerTrade)

        // Initialize email transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'testtdemoo11111@gmail.com',
                pass: 'wikvaxsgqyebphvh',
            },
        });

        // Configure email options with Minecraft theme
        const recipients = ['shakthilifesteal@gmail.com', 'adinanworkmail@gmail.com', 'fearxlifesteal@gmail.com'];

        const mailOptions = {
            from: 'testtdemoo11111@gmail.com',
            to: recipients.join(','),
            subject: '⚔️ New Trade Alert - LifeSteal Trade ⚔️',
            html: `
                <div style="
                    font-family: 'Minecraft', Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #2C2C2C;
                    color: #FFFFFF;
                    padding: 20px;
                    border: 4px solid #404040;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                ">
                    <div style="
                        background-color: #373737;
                        border: 2px solid #404040;
                        padding: 15px;
                        margin-bottom: 20px;
                        text-align: center;
                    ">
                        <h1 style="
                            color: #55FF55;
                            margin: 0;
                            text-shadow: 2px 2px #1a1a1a;
                            font-size: 24px;
                        ">
                            🏰 NEW TRADE ALERT 🏰
                        </h1>
                        ${isFirstTrade ? `
                        <div style="
                            background-color: #FFD700;
                            color: #000000;
                            padding: 8px;
                            margin-top: 10px;
                            border-radius: 4px;
                            font-weight: bold;
                        ">
                            🌟 First-Time Trader - 50% Discount Applied! 🌟
                        </div>
                        ` : ''}
                    </div>

                    <div style="
                        background-color: #373737;
                        border: 2px solid #404040;
                        padding: 15px;
                        margin-bottom: 10px;
                    ">
                        <div style="margin: 10px 0;">
                            <p style="
                                margin: 5px 0;
                                padding: 8px;
                                background-color: #2C2C2C;
                                border: 1px solid #404040;
                            ">
                                <span style="color: #FFAA00;">👤 Player:</span> 
                                <span style="color: #FFFFFF;">${player.name}</span>
                            </p>
                            
                            <p style="
                                margin: 5px 0;
                                padding: 8px;
                                background-color: #2C2C2C;
                                border: 1px solid #404040;
                            ">
                                <span style="color: #FFAA00;">📦 Item:</span> 
                                <span style="color: #FFFFFF;">${trade.itemName}</span>
                            </p>
                            
                            <p style="
                                margin: 5px 0;
                                padding: 8px;
                                background-color: #2C2C2C;
                                border: 1px solid #404040;
                            ">
                                <span style="color: #FFAA00;">🔢 Quantity:</span> 
                                <span style="color: #FFFFFF;">${quantity} stacks</span>
                            </p>
                            
                            <p style="
                                margin: 5px 0;
                                padding: 8px;
                                background-color: #2C2C2C;
                                border: 1px solid #404040;
                            ">
                                <span style="color: #FFAA00;">💎 Payment:</span> 
                                <span style="color: #FFFFFF;">
                                    ${finalPrice} ${paymentMethod === 'ingot' ? 'Ingots' : 'Rs'}
                                    ${isFirstTrade ? `<span style="color: #FFD700;"> (50% off!)</span>` : ''}
                                </span>
                            </p>
                            
                            <p style="
                                margin: 5px 0;
                                padding: 8px;
                                background-color: #2C2C2C;
                                border: 1px solid #404040;
                            ">
                                <span style="color: #FFAA00;">⏳ Status:</span> 
                                <span style="color: #FFFF55;">Pending</span>
                            </p>
                        </div>
                    </div>
                    
                    <div style="
                        text-align: center;
                        margin-top: 20px;
                        padding: 10px;
                        background-color: #373737;
                        border: 2px solid #404040;
                    ">
                        <p style="
                            color: #AAAAAA;
                            margin: 0;
                            font-size: 12px;
                        ">
                            LifeSteal Trade System
                        </p>
                    </div>
                </div>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            playerTrade,
            isFirstTrade,
            discount: isFirstTrade ? '50%' : '0%'
        });
    } catch (error) {
        console.error('Trade creation error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getPlayerTrades = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all trades for the player and populate trade details
        const playerTrades = await PlayerTrade.find({ playerId: userId })
            .populate({
                path: 'tradeId',
                select: 'itemName img price quantity status deliveryStatus'
            })
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json(playerTrades);
    } catch (error) {
        console.error('Error fetching player trades:', error);
        res.status(500).json({ message: 'Error fetching player trades', error: error.message });
    }
};

exports.cancelTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;

        // Find the player trade
        const playerTrade = await PlayerTrade.findById(tradeId);

        if (!playerTrade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        // Check if trade is already completed or cancelled
        if (playerTrade.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot cancel trade that is ${playerTrade.status}` 
            });
        }

        // Update the trade status to cancelled
        playerTrade.status = 'cancelled';
        await playerTrade.save();

        // Restore the quantity to the original trade
        await Trade.findByIdAndUpdate(
            playerTrade.tradeId,
            {
                $inc: { quantity: playerTrade.quantity },
                $set: { stockOut: false }
            }
        );

        // If this was the player's first trade and it was completed,
        // we need to update their trade count
        if (playerTrade.isFirstTrade) {
            await Player.findByIdAndUpdate(
                playerTrade.playerId,
                { $inc: { totalTrades: -1 } }
            );
        }

        // Optional: Send email notification about cancellation
        const player = await Player.findById(playerTrade.playerId);
        if (player && player.email) {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'testtdemoo11111@gmail.com',
                    pass: 'wikvaxsgqyebphvh',
                },
            });

            const mailOptions = {
                from: 'testtdemoo11111@gmail.com',
                to: player.email,
                subject: 'Trade Cancellation Confirmation',
                html: `
                    <h2>Trade Cancellation Confirmation</h2>
                    <p>Your trade has been successfully cancelled.</p>
                    <p>Trade Details:</p>
                    <ul>
                        <li>Trade ID: ${tradeId}</li>
                        <li>Quantity: ${playerTrade.quantity}</li>
                        <li>Total Price (Ingots): ${playerTrade.totalPrice.ingot}</li>
                        <li>Total Price (RS): ${playerTrade.totalPrice.rs}</li>
                    </ul>
                    <p>If you did not request this cancellation, please contact support immediately.</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email error:', error);
                }
            });
        }

        res.status(200).json({ 
            message: 'Trade cancelled successfully',
            trade: playerTrade 
        });

    } catch (error) {
        console.error('Error cancelling trade:', error);
        res.status(500).json({ 
            message: 'Error cancelling trade', 
            error: error.message 
        });
    }
};

exports.getAllPlayerTrades = async (req, res) => {
    console.log("Fetching player trades...");
    try {
        const playerTrades = await PlayerTrade.find()
            .populate('playerId', 'name') // Populate player name
            .populate('tradeId', 'itemName img') // Populate trade item name and img
            .sort({ createdAt: -1 }); // Most recent first
        
        console.log("Fetched player trades:", playerTrades);
        res.status(200).json(playerTrades);
    } catch (error) {
        console.error("Error fetching player trades:", error);
        res.status(500).json({ error: error.message });
    }
};



exports.updateTradeStatus = async (req, res) => {
    console.log("tadeupdate")
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("id",id,status)
        
        const updatedTrade = await PlayerTrade.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );  
        console.log("updatedTrade",updatedTrade)
        res.status(200).json(updatedTrade);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};