"use client"
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import Layout from '../../components/Layout/Layout';
import ProductGrid from '../../../shared/components/Product/ProductGrid';
// import ProductFilters from '../../../shared/components/Product/ProductFilters';
import Loader from '../../../shared/components/UI/Loader';
import ErrorMessage from '../../../shared/components/UI/ErrorMessage';
import ApiErrorMessage from '../../../shared/components/UI/ApiErrorMessage';
import { getCollectionByHandle, getCollectionFilters } from '../../../lib/shopify';
import { useParams } from 'next/navigation';

export default function CollectionPage() {
    const { handle } = useParams()
  
  console.log(`Collection page rendering with handle: ${handle}`);
  
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState<any>([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string |null>(null);
  const [apiError, setApiError] = useState(false);
  
  // Fetch collection data when the handle changes
  useEffect(() => {
    if (handle) {
      fetchCollection(handle, activeFilters);
      fetchFilters(handle);
    }
  }, [handle]);
  
  // Re-fetch collection when filters change
  useEffect(() => {
    if (handle && Object.keys(activeFilters).length > 0) {
      fetchCollection(handle, activeFilters);
    }
  }, [activeFilters, handle]);
  
  const fetchCollection = async (collectionHandle, filterValues) => {
    try {
      setLoading(true);
      setApiError(false);
      const collectionData = await getCollectionByHandle(collectionHandle, filterValues);
      
      if (collectionData) {
        setCollection(collectionData);
        setProducts(collectionData.products || []);
        setError(null);
      } else {
        setError('Collection not found');
        setApiError(true);
      }
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load collection. Please try again later.');
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFilters = async (collectionHandle) => {
    try {
      const filtersData = await getCollectionFilters(collectionHandle);
      setFilters(filtersData);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    
    // Update URL with filter parameters
    const queryParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]:any) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.set(key, value);
      }
    });
    
    const newUrl = `${window.location.pathname}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    // router.push(newUrl, undefined, { shallow: true });
  };
  
  // Handle sorting change
  const handleSortChange = (e) => {
    const value = e.target.value;
    let sortKey, reverse;
    
    switch (value) {
      case 'price-low-high':
        sortKey = 'PRICE';
        reverse = false;
        break;
      case 'price-high-low':
        sortKey = 'PRICE';
        reverse = true;
        break;
      case 'title-a-z':
        sortKey = 'TITLE';
        reverse = false;
        break;
      case 'title-z-a':
        sortKey = 'TITLE';
        reverse = true;
        break;
      case 'newest':
        sortKey = 'CREATED';
        reverse = true;
        break;
      default:
        sortKey = 'BEST_SELLING';
        reverse = false;
    }
    
    // Update active filters with sort parameters
    handleFilterChange({
      ...activeFilters,
      sortKey,
      reverse
    });
  };
  
  const pageTitle = collection ? `${collection?.title} Collection` : 'Collection';
  
  return (
    // <Layout title={`${pageTitle} | ShopApp`}>
      <div className="container mx-auto px-4">
        {apiError ? (
          <ApiErrorMessage apiUrl={process.env.NEXT_PUBLIC_SHOPIFY_API_URL} />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            action={() => fetchCollection(handle, activeFilters)} 
            actionText="Try Again" 
          />
        ) : (
          <>
            {loading && !collection ? (
              <div className="flex justify-center items-center py-20">
                <Loader size="large" />
              </div>
            ) : (
              <>
                {/* Collection heading */}
                {collection && (
                  <div className="mb-6 pt-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{collection.title}</h1>
                    {collection.description && (
                      <p className="text-gray-600">{collection.description}</p>
                    )}
                  </div>
                )}
                
                {/* Sort and filter section */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  {/* <div className="w-full md:w-1/4">
                    <ProductFilters 
                      availableFilters={filters}
                      activeFilters={activeFilters}
                      onFilterChange={handleFilterChange}
                    />
                  </div> */}
                  
                  <div className="w-full">
                    {/* Sort dropdown */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-sm text-gray-600">
                        {!loading && products.length > 0 && (
                          <span>{products.length} products</span>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="sortOrder" className="sr-only">Sort by</label>
                        <select
                          id="sortOrder"
                          className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          onChange={handleSortChange}
                          defaultValue="best-selling"
                        >
                          <option value="best-selling">Best Selling</option>
                          <option value="price-low-high">Price: Low to High</option>
                          <option value="price-high-low">Price: High to Low</option>
                          <option value="title-a-z">Alphabetically: A-Z</option>
                          <option value="title-z-a">Alphabetically: Z-A</option>
                          <option value="newest">Date: Newest First</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Products grid */}
                    <ProductGrid 
                      products={products} 
                      loading={loading} 
                      emptyMessage="No products found in this collection" 
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    // </Layout>
  );
}
