# Balaram AI Enhanced - Google Search & RAG Integration

## 🚀 New Features Added

### 1. **Google Search Grounding** 🔍
- **Real-time web access** through Gemini's built-in Google Search capability
- **Automatic activation** when users use trigger words like:
  - "search for..."
  - "find latest..."
  - "current price of..."
  - "what's the latest on..."
  - "recent news about..."
  - "lookup..."
  - "predict based on current data..."

### 2. **RAG (Retrieval-Augmented Generation)** 🧠
- **Curated agricultural knowledge base** with farming best practices
- **Contextual document retrieval** based on user queries
- **Categories covered**:
  - Crop Management
  - Pest Control
  - Soil Health
  - Weather Patterns
  - Market Prices
  - Fertilizers & NPK
  - Irrigation Techniques

### 3. **Enhanced Context Integration** 📊
- **Real-time sensor data** integration in responses
- **Location-aware** recommendations
- **Smart context switching** between search, knowledge base, and sensor data

## 🛠️ Technical Implementation

### Files Modified/Added:

1. **`app/dashboard/balaram-ai/utils/ragService.ts`** (NEW)
   - RAG service with agricultural knowledge base
   - Document retrieval and scoring algorithms
   - Sensor context integration

2. **`app/dashboard/balaram-ai/services/geminiWebSocket.ts`** (ENHANCED)
   - Added Google Search grounding via `tools: [{ google_search: {} }]`
   - Enhanced system instructions for search capabilities
   - RAG context injection in user queries
   - Search result metadata processing

3. **`app/dashboard/balaram-ai/components/CameraPreview.tsx`** (ENHANCED)
   - Added search results callback
   - Enhanced WebSocket initialization

4. **`app/dashboard/balaram-ai/page.tsx`** (ENHANCED)
   - Added UI for search capabilities
   - Search results display
   - Example queries showcase

5. **`app/api/ml/agriculture/recommendation/route.ts`** (NEW)
   - API proxy to FastAPI ML service
   - Agriculture recommendation integration

## 🎯 How It Works

### Google Search Flow:
1. User speaks query with search triggers
2. Gemini automatically detects search intent
3. Performs Google Search in background
4. Integrates search results into response
5. Provides source attribution

### RAG Flow:
1. User query is processed by RAG service
2. Relevant agricultural documents are retrieved
3. Context is injected into Gemini prompt
4. Enhanced response with local knowledge

### Sensor Integration:
1. Current sensor readings are fetched
2. Contextual alerts are generated
3. Recommendations are personalized based on data

## 🌾 Agricultural Use Cases

### Search Queries:
- **"Search for current wheat prices in Punjab"**
  - Gets real-time market data from web
  - Compares with local sensor conditions
  
- **"Find latest pest control methods for tomatoes"**
  - Retrieves current research and methods
  - Suggests based on local climate data

- **"What's the weather forecast for next week?"**
  - Gets accurate weather predictions
  - Correlates with irrigation needs

### Knowledge Base Queries:
- **"Tell me about crop rotation"**
  - Retrieves curated best practices
  - Adapts to local soil conditions
  
- **"How to manage NPK levels?"**
  - Uses current sensor NPK readings
  - Provides specific fertilizer recommendations

- **"Soil moisture management tips"**
  - Analyzes current moisture levels
  - Suggests irrigation scheduling

## 🔧 Configuration

### Environment Variables:
```env
# Gemini API (required)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# ML Service (optional)
ML_SERVICE_URL=http://localhost:8000

# Sensor Data APIs
NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID=your_channel_id
NEXT_PUBLIC_THINGSPEAK_READ_API_KEY=your_api_key
```

### Google Search Setup:
- Google Search grounding is **automatically enabled** in Gemini 2.0 Flash
- No additional API keys required
- Works through Gemini's built-in capabilities

## 📱 User Interface

### Enhanced Features Display:
- **Green Card**: Google Search capabilities
- **Blue Card**: Agricultural Knowledge base
- **Purple Card**: Smart Context integration
- **Orange Alert**: Active search results display

### Example Queries Section:
- **Search Queries**: Web-based information retrieval
- **Knowledge Queries**: Local database queries

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   - Add your Gemini API key
   - Configure sensor data sources

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Test Enhanced Features**:
   - Navigate to `/dashboard/balaram-ai`
   - Try search queries: "Search for current rice prices"
   - Try knowledge queries: "Tell me about NPK management"

## 🔍 Search Trigger Words

The system automatically detects these phrases for Google Search:
- search, find, lookup
- what is, what are, tell me about
- current price, latest, recent
- today, now, predict, forecast
- market rate, news about, information on

## 📊 RAG Knowledge Categories

1. **Crop Management**: Rotation, varieties, planting techniques
2. **Pest Control**: IPM strategies, biological controls
3. **Soil Health**: pH management, organic matter, erosion
4. **Weather**: Monsoon patterns, climate adaptation
5. **Market Prices**: MSP, price trends, e-NAM
6. **Fertilizers**: NPK management, application rates
7. **Irrigation**: Water management, drip systems, scheduling

## 🎯 Benefits

### For Farmers:
- **Real-time market information** for better selling decisions
- **Latest agricultural research** and techniques
- **Personalized recommendations** based on field conditions
- **Multilingual support** (Bengali/English)

### For Agricultural Extension:
- **Comprehensive knowledge base** for training
- **Current best practices** from web sources
- **Data-driven recommendations** with sensor integration

## 🔮 Future Enhancements

1. **Vector Database Integration**: Replace simple keyword matching with semantic search
2. **Multi-language Knowledge Base**: Add regional language content
3. **Real-time Document Updates**: Dynamic knowledge base updates
4. **Advanced Search Filters**: Category-specific search refinement
5. **Voice Search Optimization**: Better trigger word detection
6. **Offline Knowledge Cache**: Local storage for remote areas

## 🐛 Troubleshooting

### Common Issues:

1. **Search not triggering**:
   - Ensure trigger words are used clearly
   - Check Gemini API key is valid
   - Verify WebSocket connection

2. **RAG context not appearing**:
   - Check console logs for retrieval errors
   - Verify knowledge base is loaded
   - Test with simpler queries

3. **Sensor data not integrating**:
   - Verify ThingSpeak configuration
   - Check sensor data API responses
   - Ensure data format is correct

### Debug Mode:
Enable detailed logging by checking browser console for:
- `[RAG]` - Knowledge retrieval logs
- `[Google Search Grounding]` - Search activation logs
- `[WebSocket]` - Connection and message logs

## 📞 Support

For technical support or feature requests:
- Check console logs for detailed error messages
- Verify all environment variables are set
- Test with simple queries first
- Review network connectivity for external APIs

---

**Enhanced Balaram AI** brings the power of real-time web search and curated agricultural knowledge to precision farming, making it the most comprehensive AI assistant for Indian agriculture. 🌾🚀